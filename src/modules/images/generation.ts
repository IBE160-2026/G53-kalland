import { and, type AnyColumn, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { fileVersions, imageKeywords, images } from "@/db/schema";
import { generate, type AiErrorCategory, type AiResult } from "@/modules/ai";
import { makeAiInput } from "@/modules/media";
import { log } from "@/modules/shared/log";
import { stripControlCharacters } from "@/modules/shared/text";

// Twice the provider timeout (30 s), so a live call never outlives its lease (AD-12).
export const LEASE_MS = 60_000;

export const COORDINATES_RULE = "Never turn coordinates into a place name.";

type FailureReason = AiErrorCategory | "interrupted";
type ImageRow = typeof images.$inferSelect;

// One line per value: line breaks inside embedded text become spaces, so a value cannot add lines.
function oneLine(value: string): string {
  return value.replace(/\s*[\r\n]+\s*/g, " ");
}

// The text input (FR-12): the stored embedded metadata, headed by the coordinates rule.
function buildMetadataText(row: ImageRow, keywords: string[]): string {
  const camera = [row.cameraMake, row.cameraModel].filter(Boolean).join(" ");
  const lines = [
    row.title && `Title: ${oneLine(row.title)}`,
    row.description && `Description: ${oneLine(row.description)}`,
    row.altText && `Alt text: ${oneLine(row.altText)}`,
    keywords.length > 0 && `Keywords: ${keywords.map(oneLine).join(", ")}`,
    row.dateTaken && `Date taken: ${row.dateTaken}${row.dateTakenOffset ? ` ${row.dateTakenOffset}` : ""}`,
    camera && `Camera: ${oneLine(camera)}`,
    row.latitude !== null && row.longitude !== null && `GPS: ${row.latitude}, ${row.longitude}`,
  ].filter((line): line is string => Boolean(line));
  const body = lines.length > 0 ? `Embedded metadata from the file:\n${lines.join("\n")}` : "The file has no embedded metadata.";
  return `${COORDINATES_RULE}\n\n${body}`;
}

// Step 1, claim (AD-12): `queued` → `generating` with a new token and a lease. Null when the image is
// not `queued` (someone else has it, or it is gone).
async function claim(imageId: string): Promise<ImageRow | null> {
  const [row] = await getDb()
    .update(images)
    .set({
      processingState: "generating",
      generationToken: sql`gen_random_uuid()`,
      leaseUntil: sql`now() + make_interval(secs => ${LEASE_MS / 1000})`,
      updatedAt: new Date(),
    })
    .where(and(eq(images.id, imageId), eq(images.processingState, "queued")))
    .returning();
  return row ?? null;
}

// The save is only for the claim that is still current, and only while the image is a draft.
function holdsClaim(imageId: string, token: string) {
  return and(eq(images.id, imageId), eq(images.generationToken, token), eq(images.status, "draft"));
}

function releaseClaim() {
  return { generationToken: null, leaseUntil: null, updatedAt: new Date() };
}

function keepStaff(value: AnyColumn, source: AnyColumn, generated: string) {
  return sql`case when ${source} = 'staff' then ${value} else ${generated} end`;
}

function keepStaffSource(source: AnyColumn) {
  return sql`case when ${source} = 'staff' then 'staff' else 'ai' end`;
}

// Step 3, save (AD-10, AD-12): replaces the fields whose source is not `staff` and the `embedded` and
// `ai` keyword rows. AI keywords are deduplicated case-insensitively; one that clashes with a kept
// `shared` or `staff` keyword is skipped. Returns false when the claim was lost: nothing is written.
export async function saveAiResult(imageId: string, token: string, output: AiResult): Promise<boolean> {
  const title = stripControlCharacters(output.title);
  const description = stripControlCharacters(output.description, { multiline: true });
  const altText = stripControlCharacters(output.altText);
  return getDb().transaction(async (tx) => {
    const updated = await tx
      .update(images)
      .set({
        title: keepStaff(images.title, images.titleSource, title),
        titleSource: keepStaffSource(images.titleSource),
        description: keepStaff(images.description, images.descriptionSource, description),
        descriptionSource: keepStaffSource(images.descriptionSource),
        altText: keepStaff(images.altText, images.altTextSource, altText),
        altTextSource: keepStaffSource(images.altTextSource),
        processingState: "ready",
        failureReason: null,
        ...releaseClaim(),
      })
      .where(holdsClaim(imageId, token))
      .returning({ id: images.id });
    if (updated.length === 0) return false;

    await tx.delete(imageKeywords).where(and(eq(imageKeywords.imageId, imageId), inArray(imageKeywords.source, ["embedded", "ai"])));
    const kept = await tx.select({ keyword: imageKeywords.keyword }).from(imageKeywords).where(eq(imageKeywords.imageId, imageId));
    const seen = new Set(kept.map((row) => row.keyword.toLowerCase()));
    const rows = [];
    for (const { term, category } of output.keywords) {
      const keyword = stripControlCharacters(term);
      if (!keyword || seen.has(keyword.toLowerCase())) continue;
      seen.add(keyword.toLowerCase());
      rows.push({ imageId, keyword, source: "ai" as const, category });
    }
    if (rows.length > 0) await tx.insert(imageKeywords).values(rows).onConflictDoNothing();
    return true;
  });
}

// Fails a claimed image (FR-16a). Embedded fields and keywords are left as they are.
async function markFailed(imageId: string, token: string, reason: FailureReason): Promise<void> {
  await getDb()
    .update(images)
    .set({ processingState: "failed", failureReason: reason, ...releaseClaim() })
    .where(holdsClaim(imageId, token));
}

// The only generation path (AD-12), in three steps that are never one transaction: claim, generate
// (media makes the AI input, ai runs the provider and records the run), save. Called inline after an
// upload completes. Never throws: an unexpected error is logged and fails the image as `unavailable`.
export async function generateMetadata(imageId: string): Promise<void> {
  let token: string | null = null;
  try {
    const row = await claim(imageId);
    if (!row?.generationToken) return;
    token = row.generationToken;

    const db = getDb();
    const embedded = await db
      .select({ keyword: imageKeywords.keyword })
      .from(imageKeywords)
      .where(and(eq(imageKeywords.imageId, imageId), eq(imageKeywords.source, "embedded")));
    const [version] = await db
      .select({ id: fileVersions.id })
      .from(fileVersions)
      .where(eq(fileVersions.imageId, imageId))
      .orderBy(desc(fileVersions.createdAt), desc(fileVersions.id))
      .limit(1);
    if (!version) throw new Error("The image has no stored file.");
    const aiImage = await makeAiInput(version.id);

    const result = await generate(imageId, {
      image: aiImage.bytes,
      mediaType: aiImage.mediaType,
      metadataText: buildMetadataText(row, embedded.map((k) => k.keyword)),
      outputLanguage: "en",
      filename: row.filename,
    });
    if (result.ok) {
      const saved = await saveAiResult(imageId, token, result.output);
      if (!saved) log.info({ imageId }, "A generation result was discarded: the claim was lost.");
    } else {
      await markFailed(imageId, token, result.category);
    }
  } catch (error) {
    log.error({ err: error, imageId }, "Metadata generation failed unexpectedly.");
    if (token) {
      await markFailed(imageId, token, "unavailable").catch((failError: unknown) =>
        log.error({ err: failError, imageId }, "Could not mark a generation as failed."),
      );
    }
  }
}

// At app start (AD-12, without the FR-15 worker): every `queued` image, and every `generating` image
// whose lease has run out, becomes `failed` with the reason "interrupted". Returns how many.
export async function failInterruptedGenerations(now: Date): Promise<number> {
  const failed = await getDb()
    .update(images)
    .set({ processingState: "failed", failureReason: "interrupted", generationToken: null, leaseUntil: null, updatedAt: now })
    .where(or(eq(images.processingState, "queued"), and(eq(images.processingState, "generating"), lt(images.leaseUntil, sql`now()`))))
    .returning({ id: images.id });
  return failed.length;
}
