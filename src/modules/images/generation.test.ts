import { mkdtemp, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { asc, eq, sql } from "drizzle-orm";
import { exiftool } from "exiftool-vendored";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { fileVersions, imageKeywords, images, metadataGenerations } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import { KEYWORD_CATEGORIES, mockReceivedInputs, type AiResult } from "@/modules/ai";
import { PLACEHOLDER_OUTPUT } from "@/modules/ai/providers/mock";
import type { Actor } from "@/modules/auth";
import { chunksOf, makeJpeg, makePng, useTempFileStore, withTags } from "@/test/images";
import { loginAs } from "@/test/login-as";
import { COORDINATES_RULE, failInterruptedGenerations, generateMetadata, LEASE_MS, saveAiResult } from "./generation";
import { completeUpload, createUploadRows } from "./uploads";

vi.mock("@/modules/ai/providers/mock-fixtures", () => ({
  MOCK_FIXTURES: {
    "fixture.jpg": {
      title: "Fishing boats in the harbour",
      description: "Small fishing boats in a calm harbour.",
      altText: "Fishing boats moored in a calm harbour.",
      keywords: [
        { term: "harbour", category: "place" },
        { term: "grey morning", category: "weather_season" },
        { term: "calm", category: "emotion" },
        { term: "grey", category: "colour_adjective" },
        { term: "mooring", category: "activity" },
        { term: "fishing boat", category: "object" },
        { term: "wide shot", category: "perspective_composition" },
      ],
    },
    "bad-output.jpg": {
      title: "A title",
      description: "A description.",
      altText: "Alt text.",
      keywords: [{ term: "harbour", category: "mood" }],
    },
  },
}));

const db = getDb();
let storeDir: string;
let workDir: string;
let ida: Actor;
const saved = { fail: process.env.MOCK_FAIL, delay: process.env.MOCK_DELAY_MS };

beforeAll(async () => {
  storeDir = await useTempFileStore();
  workDir = await mkdtemp(path.join(tmpdir(), "generation-"));
  ida = (await loginAs(fixtureUsers.ida)).actor;
});
afterEach(() => {
  for (const [name, value] of [["MOCK_FAIL", saved.fail], ["MOCK_DELAY_MS", saved.delay]] as const) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});
afterAll(async () => {
  await exiftool.end();
  await rm(storeDir, { recursive: true, force: true });
  await rm(workDir, { recursive: true, force: true });
});

const TAGS = {
  "XMP-dc:Title": "Harbour",
  "XMP-dc:Subject": ["Boat", "Sea"],
  DateTimeOriginal: "2024:06:01 05:12:30",
  Make: "Canon",
  GPSLatitude: 63.4305,
  GPSLongitude: 10.3951,
};

async function upload(filename: string, bytes?: Buffer) {
  const body = bytes ?? (await withTags(await makeJpeg(), "jpg", TAGS));
  const { images: rows } = await createUploadRows(db, ida, { filenames: [filename] });
  const result = await completeUpload(ida, rows[0].id, chunksOf(body), body.length);
  return { imageId: rows[0].id, result };
}

async function imageRow(imageId: string) {
  const [row] = await db.select().from(images).where(eq(images.id, imageId));
  return row;
}

async function keywordsOf(imageId: string) {
  const rows = await db
    .select({ keyword: imageKeywords.keyword, source: imageKeywords.source, category: imageKeywords.category })
    .from(imageKeywords)
    .where(eq(imageKeywords.imageId, imageId))
    .orderBy(asc(imageKeywords.keyword));
  return rows;
}

async function runsOf(imageId: string) {
  return db.select().from(metadataGenerations).where(eq(metadataGenerations.imageId, imageId));
}

describe("generateMetadata after an upload", () => {
  it("replaces the embedded text with the placeholder and records the run", async () => {
    const { imageId, result } = await upload("harbour.jpg");
    expect(result.processingState).toBe("ready");
    expect(await imageRow(imageId)).toMatchObject({
      processingState: "ready",
      failureReason: null,
      generationToken: null,
      leaseUntil: null,
      title: PLACEHOLDER_OUTPUT.title,
      titleSource: "ai",
      description: PLACEHOLDER_OUTPUT.description,
      descriptionSource: "ai",
      altText: PLACEHOLDER_OUTPUT.altText,
      altTextSource: "ai",
      // Facts are not AI fields; they stay.
      cameraMake: "Canon",
      latitude: 63.4305,
    });
    const keywords = await keywordsOf(imageId);
    expect(keywords).toHaveLength(7);
    expect(keywords.every((k) => k.source === "ai")).toBe(true);
    expect(keywords.map((k) => k.category).sort()).toEqual([...KEYWORD_CATEGORIES].sort());
    expect(await runsOf(imageId)).toEqual([
      expect.objectContaining({ outcome: "success", provider: "mock", model: "mock", promptVersion: "v3" }),
    ]);
  });

  it("sends the mock a metadata-free image and the embedded metadata as text, with the coordinates rule (SC-13)", async () => {
    await upload("recorded.jpg", await withTags(await makeJpeg({ width: 2000, height: 1000, icc: true }), "jpg", TAGS));
    const received = mockReceivedInputs().at(-1)!;
    expect(received).toMatchObject({ filename: "recorded.jpg", mediaType: "image/jpeg", outputLanguage: "en" });
    expect(received.metadataText.startsWith(COORDINATES_RULE)).toBe(true);
    for (const line of ["Title: Harbour", "Keywords: Boat, Sea", "Date taken: 2024-06-01 05:12:30", "Camera: Canon", "GPS: 63.4305, 10.3951"]) {
      expect(received.metadataText).toContain(line);
    }
    expect(received.metadataText).not.toContain("recorded.jpg");

    const file = path.join(workDir, "received.jpg");
    await writeFile(file, received.image);
    const tags = await exiftool.readRaw(file, { readArgs: ["-a", "-G0"] });
    const groups = new Set(Object.keys(tags).filter((key) => key.includes(":")).map((key) => key.split(":")[0]));
    for (const group of ["EXIF", "XMP", "IPTC", "ICC_Profile"]) expect(groups.has(group)).toBe(false);
    expect(tags).toMatchObject({ "File:ImageWidth": 1568, "File:ImageHeight": 784 });
  });

  it("saves a seed image's fixture", async () => {
    const { imageId } = await upload("fixture.jpg");
    expect(await imageRow(imageId)).toMatchObject({ processingState: "ready", title: "Fishing boats in the harbour", titleSource: "ai" });
    expect((await keywordsOf(imageId)).map((k) => [k.keyword, k.category])).toContainEqual(["fishing boat", "object"]);
  });

  it("fails a file whose name contains fail, keeping its embedded text; the upload itself succeeds", async () => {
    const { imageId, result } = await upload("fail-boat.png", await withTags(await makePng(), "png", { "XMP-dc:Title": "Boat", "XMP-dc:Subject": ["Boat"] }));
    expect(result).toMatchObject({ processingState: "failed", title: "Boat" });
    expect(await imageRow(imageId)).toMatchObject({
      status: "draft",
      processingState: "failed",
      failureReason: "unavailable",
      generationToken: null,
      title: "Boat",
      titleSource: "embedded",
    });
    expect(await keywordsOf(imageId)).toEqual([{ keyword: "Boat", source: "embedded", category: null }]);
    expect(await runsOf(imageId)).toEqual([expect.objectContaining({ outcome: "error", errorCategory: "unavailable" })]);
  });

  it("fails every image while MOCK_FAIL=true", async () => {
    process.env.MOCK_FAIL = "true";
    const { imageId } = await upload("any.jpg");
    expect(await imageRow(imageId)).toMatchObject({ processingState: "failed", failureReason: "unavailable", title: "Harbour" });
  });

  it("fails output outside the schema as invalid_output, recording the raw output", async () => {
    const { imageId } = await upload("bad-output.jpg");
    expect(await imageRow(imageId)).toMatchObject({ processingState: "failed", failureReason: "invalid_output", title: "Harbour" });
    const [run] = await runsOf(imageId);
    expect(run).toMatchObject({ outcome: "error", errorCategory: "invalid_output" });
    expect(run.rawOutput).toContain('"category":"mood"');
  });

  it("continues with the next image of the batch after one fails", async () => {
    const { images: rows } = await createUploadRows(db, ida, { filenames: ["fail-a.png", "b.png"] });
    for (const row of rows) {
      const bytes = await makePng();
      await completeUpload(ida, row.id, chunksOf(bytes), bytes.length);
    }
    expect(await imageRow(rows[0].id)).toMatchObject({ processingState: "failed" });
    expect(await imageRow(rows[1].id)).toMatchObject({ processingState: "ready", title: PLACEHOLDER_OUTPUT.title });
  });

  it("fails the image as unavailable when an unexpected error stops it, such as a missing original", async () => {
    const { imageId } = await upload("lost-original.jpg");
    const [version] = await db.select({ id: fileVersions.id }).from(fileVersions).where(eq(fileVersions.imageId, imageId));
    await unlink(path.join(storeDir, "originals", version.id));
    await db.update(images).set({ processingState: "queued" }).where(eq(images.id, imageId));
    await expect(generateMetadata(imageId)).resolves.toBeUndefined();
    expect(await imageRow(imageId)).toMatchObject({ processingState: "failed", failureReason: "unavailable", generationToken: null });
  });

  it("does nothing for an image that is not queued", async () => {
    const { imageId } = await upload("done.jpg");
    const before = await imageRow(imageId);
    await generateMetadata(imageId);
    expect(await imageRow(imageId)).toEqual(before);
    expect(await runsOf(imageId)).toHaveLength(1);
  });
});

const OUTPUT: AiResult = {
  title: "AI title",
  description: "AI description.",
  altText: "AI alt text.",
  keywords: [
    { term: "boat", category: "object" },
    { term: "Boat", category: "object" },
    { term: "fjord", category: "place" },
    { term: "calm", category: "emotion" },
  ],
  usage: { inputTokens: 0, outputTokens: 0 },
};

// A claimed image with staff, embedded and shared values, as a save would find it.
async function claimedRow(fields: Partial<typeof images.$inferInsert> = {}) {
  const { images: rows } = await createUploadRows(db, ida, { filenames: ["claimed.jpg"] });
  const imageId = rows[0].id;
  const token = crypto.randomUUID();
  await db
    .update(images)
    .set({
      processingState: "generating",
      generationToken: token,
      leaseUntil: sql`now() + interval '1 minute'`,
      title: "Staff title",
      titleSource: "staff",
      description: "Embedded description",
      descriptionSource: "embedded",
      ...fields,
    })
    .where(eq(images.id, imageId));
  await db.insert(imageKeywords).values([
    { imageId, keyword: "Fjord", source: "staff" },
    { imageId, keyword: "Client brand", source: "shared" },
    { imageId, keyword: "Sea", source: "embedded" },
    { imageId, keyword: "old ai", source: "ai", category: "object" },
  ]);
  return { imageId, token };
}

describe("saveAiResult", () => {
  it("keeps staff fields and shared/staff keywords, replaces the rest, and dedupes AI keywords", async () => {
    const { imageId, token } = await claimedRow();
    expect(await saveAiResult(imageId, token, OUTPUT)).toBe(true);
    expect(await imageRow(imageId)).toMatchObject({
      processingState: "ready",
      generationToken: null,
      leaseUntil: null,
      title: "Staff title",
      titleSource: "staff",
      description: "AI description.",
      descriptionSource: "ai",
      altText: "AI alt text.",
      altTextSource: "ai",
    });
    expect(await keywordsOf(imageId)).toEqual([
      { keyword: "boat", source: "ai", category: "object" },
      { keyword: "calm", source: "ai", category: "emotion" },
      { keyword: "Client brand", source: "shared", category: null },
      { keyword: "Fjord", source: "staff", category: null },
    ]);
  });

  it("removes control characters from the AI text, keeping the description's line break", async () => {
    const { imageId, token } = await claimedRow({ titleSource: null });
    const output: AiResult = {
      ...OUTPUT,
      title: "AI\u0007 title",
      description: "First line.\nSecond\u001b line.",
      keywords: [{ term: "Rope\u0007", category: "object" }],
    };
    expect(await saveAiResult(imageId, token, output)).toBe(true);
    expect(await imageRow(imageId)).toMatchObject({ title: "AI title", description: "First line.\nSecond line." });
    expect((await keywordsOf(imageId)).filter((k) => k.source === "ai")).toEqual([{ keyword: "Rope", source: "ai", category: "object" }]);
  });

  it.each([
    ["the token changed", {}, crypto.randomUUID()],
    ["the image is no longer a draft", { status: "published" as const }, null],
  ])("discards the result when %s, writing nothing", async (_name, fields, otherToken) => {
    const { imageId, token } = await claimedRow(fields);
    const before = await imageRow(imageId);
    const keywordsBefore = await keywordsOf(imageId);
    expect(await saveAiResult(imageId, otherToken ?? token, OUTPUT)).toBe(false);
    expect(await imageRow(imageId)).toEqual(before);
    expect(await keywordsOf(imageId)).toEqual(keywordsBefore);
  });

  it("through generateMetadata, a lost claim still records the run", async () => {
    const { imageId } = await upload("lost-claim.jpg");
    await db.update(images).set({ processingState: "queued" }).where(eq(images.id, imageId));
    // The claim is taken over while the mock is still answering.
    process.env.MOCK_DELAY_MS = "300";
    const running = generateMetadata(imageId);
    await vi.waitFor(async () => expect((await imageRow(imageId)).processingState).toBe("generating"));
    const otherToken = crypto.randomUUID();
    await db.update(images).set({ generationToken: otherToken }).where(eq(images.id, imageId));
    await running;
    expect(await imageRow(imageId)).toMatchObject({ processingState: "generating", generationToken: otherToken });
    expect(await runsOf(imageId)).toHaveLength(2);
  });
});

describe("failInterruptedGenerations", () => {
  it("fails queued images and generating images whose lease ran out, as interrupted", async () => {
    const now = new Date();
    const { images: rows } = await createUploadRows(db, ida, { filenames: ["queued.jpg", "expired.jpg", "live.jpg"] });
    const [queued, expired, live] = rows.map((row) => row.id);
    await db.update(images).set({ processingState: "queued" }).where(eq(images.id, queued));
    const lease = (ms: number) => new Date(now.getTime() + ms);
    await db
      .update(images)
      .set({ processingState: "generating", generationToken: crypto.randomUUID(), leaseUntil: lease(-1000) })
      .where(eq(images.id, expired));
    await db
      .update(images)
      .set({ processingState: "generating", generationToken: crypto.randomUUID(), leaseUntil: lease(LEASE_MS) })
      .where(eq(images.id, live));

    await failInterruptedGenerations(now);

    for (const id of [queued, expired]) {
      expect(await imageRow(id)).toMatchObject({ processingState: "failed", failureReason: "interrupted", generationToken: null, leaseUntil: null });
    }
    expect(await imageRow(live)).toMatchObject({ processingState: "generating", failureReason: null });
  });
});
