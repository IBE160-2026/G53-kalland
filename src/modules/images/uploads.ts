import type { Readable } from "node:stream";
import { and, asc, desc, eq, lt } from "drizzle-orm";
import { getDb, type Tx } from "@/db/client";
import { batches, fileVersions, imageKeywords, images } from "@/db/schema";
import { DEFAULT_TENANT_ID } from "@/db/tenant";
import { assertStaff, type Actor } from "@/modules/auth";
import {
  discardUploadFiles,
  MAX_UPLOAD_BYTES,
  MediaRejected,
  openDerivedFile,
  readStagedMetadata,
  receiveUpload,
  stageDerivedFiles,
  storeStagedFiles,
  type MediaRejectionReason,
} from "@/modules/media";
import { isUniqueViolation } from "@/modules/shared/db-errors";
import { Conflict, Forbidden, ModuleError, NotFound } from "@/modules/shared/errors";
import { log } from "@/modules/shared/log";
import { generateMetadata } from "./generation";

// Why an upload was not added. Each reason has one NFR-7 message, `upload.rejected.<reason>`.
export type UploadRejectionReason = MediaRejectionReason | "duplicate";

const REJECTION_STATUS: Record<UploadRejectionReason, number> = {
  notImage: 415,
  tooLarge: 413,
  damaged: 422,
  unsafePreview: 422,
  duplicate: 409,
};

export class UploadRejected extends ModuleError {
  readonly status: number;
  constructor(readonly reason: UploadRejectionReason) {
    super(`upload.rejected.${reason}`);
    this.status = REJECTION_STATUS[reason];
  }
}

export const STALE_UPLOAD_MS = 60 * 60 * 1000;

export type UploadRow = {
  id: string;
  filename: string;
  title: string | null;
  processingState: "uploading" | "queued" | "generating" | "ready" | "failed";
  thumbnailUrl: string | null;
};

function thumbnailUrl(imageId: string): string {
  return `/api/images/${imageId}/thumbnail`;
}

// Creates the image rows of an upload, all `uploading`, before any file is sent (AD-11). Without a
// batch id it creates the batch, owned by the actor; a single file is a batch of one. Each image gets
// its own copy of the batch defaults (AD-9).
export async function createUploadRows(
  tx: Tx,
  actor: Actor,
  input: { batchId?: string; filenames: string[] },
): Promise<{ batchId: string; images: { id: string; filename: string }[] }> {
  assertStaff(actor);
  return tx.transaction(async (inner) => {
    const defaults = { id: batches.id, ownerId: batches.ownerId, visibility: batches.visibility, priceTier: batches.priceTier };
    const [batch] = input.batchId
      ? await inner.select(defaults).from(batches).where(eq(batches.id, input.batchId))
      : await inner.insert(batches).values({ tenantId: DEFAULT_TENANT_ID, ownerId: actor.userId }).returning(defaults);
    if (!batch) throw new NotFound();
    if (batch.ownerId !== actor.userId) throw new Forbidden();
    const rows = await inner
      .insert(images)
      .values(
        input.filenames.map((filename) => ({
          tenantId: DEFAULT_TENANT_ID,
          batchId: batch.id,
          uploadedBy: actor.userId,
          filename,
          visibility: batch.visibility,
          priceTier: batch.priceTier,
        })),
      )
      .returning({ id: images.id, filename: images.filename });
    return { batchId: batch.id, images: rows };
  });
}

// Deletes an upload that did not complete: its row (only while still `uploading`) and its files.
// Cleanup problems are logged, never thrown over the reason the upload failed.
async function deleteUpload(imageId: string, tmpKey?: string, fileVersionId?: string): Promise<void> {
  try {
    await getDb()
      .delete(images)
      .where(and(eq(images.id, imageId), eq(images.processingState, "uploading")));
    if (tmpKey) await discardUploadFiles(tmpKey, fileVersionId);
  } catch (error) {
    log.error({ err: error, imageId }, "Could not clean up a failed upload.");
  }
}

// Receives the file of an `uploading` image row and stores it as a draft (AD-11): the body streams to
// tmp/ with its hash; the thumbnail and preview are made and checked; embedded metadata is read; then
// one short transaction stores the file version, the fields and keywords, moves the files to their final
// keys and sets `queued`. Any failure up to there deletes the row and the files. A rejected file throws
// UploadRejected; a byte-identical file already stored is `duplicate`. After the commit, generation runs
// inline (AD-12) and the image ends `ready` or `failed`; a failed generation never fails the upload.
export async function completeUpload(
  actor: Actor,
  imageId: string,
  body: AsyncIterable<Uint8Array>,
  contentLength: number | null,
): Promise<{ processingState: UploadRow["processingState"]; title: string | null; thumbnailUrl: string }> {
  assertStaff(actor);
  const db = getDb();
  const [row] = await db
    .select({ uploadedBy: images.uploadedBy, processingState: images.processingState })
    .from(images)
    .where(eq(images.id, imageId));
  if (!row) throw new NotFound();
  if (row.uploadedBy !== actor.userId) throw new Forbidden();
  if (row.processingState !== "uploading") throw new Conflict();

  let tmpKey: string | undefined;
  let fileVersionId: string | undefined;
  try {
    if (contentLength !== null && contentLength > MAX_UPLOAD_BYTES) throw new MediaRejected("tooLarge");
    const received = await receiveUpload(body);
    tmpKey = received.tmpKey;
    const staged = await stageDerivedFiles(received);
    const embedded = await readStagedMetadata(received);

    await db.transaction(async (tx) => {
      const [version] = await tx
        .insert(fileVersions)
        .values({
          imageId,
          hash: staged.hash,
          mediaType: staged.mediaType,
          byteSize: staged.byteSize,
          width: staged.width,
          height: staged.height,
        })
        .returning({ id: fileVersions.id });
      fileVersionId = version.id;
      const { keywords, title, description, altText, ...facts } = embedded;
      const updated = await tx
        .update(images)
        .set({
          ...facts,
          title,
          titleSource: title ? "embedded" : null,
          description,
          descriptionSource: description ? "embedded" : null,
          altText,
          altTextSource: altText ? "embedded" : null,
          processingState: "queued",
          updatedAt: new Date(),
        })
        .where(and(eq(images.id, imageId), eq(images.processingState, "uploading")))
        .returning({ id: images.id });
      if (updated.length === 0) throw new Conflict();
      if (keywords.length > 0) {
        await tx
          .insert(imageKeywords)
          .values(keywords.map((keyword) => ({ imageId, keyword, source: "embedded" as const })))
          .onConflictDoNothing();
      }
      await storeStagedFiles(staged, version.id);
    });
  } catch (error) {
    await deleteUpload(imageId, tmpKey, fileVersionId);
    if (error instanceof MediaRejected) throw new UploadRejected(error.reason);
    if (isUniqueViolation(error)) throw new UploadRejected("duplicate");
    throw error;
  }

  await generateMetadata(imageId);
  const [stored] = await db
    .select({ processingState: images.processingState, title: images.title })
    .from(images)
    .where(eq(images.id, imageId));
  if (!stored) throw new NotFound();
  return { ...stored, thumbnailUrl: thumbnailUrl(imageId) };
}

// The startup sweep (AD-11): deletes `uploading` rows not touched for an hour. Returns how many.
export async function sweepStaleUploads(now: Date): Promise<number> {
  const deleted = await getDb()
    .delete(images)
    .where(and(eq(images.processingState, "uploading"), lt(images.updatedAt, new Date(now.getTime() - STALE_UPLOAD_MS))))
    .returning({ id: images.id });
  return deleted.length;
}

// The thumbnail of an image's latest file version. Staff only.
export async function getThumbnail(actor: Actor, imageId: string): Promise<Readable> {
  assertStaff(actor);
  const [version] = await getDb()
    .select({ id: fileVersions.id })
    .from(fileVersions)
    .where(eq(fileVersions.imageId, imageId))
    .orderBy(desc(fileVersions.createdAt), desc(fileVersions.id))
    .limit(1);
  if (!version) throw new NotFound();
  return openDerivedFile(version.id, "thumbnail");
}

// The stored rows of one of the actor's own batches, in upload order; null for a batch that does not
// exist or belongs to someone else.
export async function listBatchUploads(actor: Actor, batchId: string): Promise<{ batchId: string; rows: UploadRow[] } | null> {
  assertStaff(actor);
  const db = getDb();
  const [batch] = await db
    .select({ id: batches.id })
    .from(batches)
    .where(and(eq(batches.id, batchId), eq(batches.ownerId, actor.userId)));
  if (!batch) return null;
  const rows = await db
    .select({ id: images.id, filename: images.filename, title: images.title, processingState: images.processingState })
    .from(images)
    .where(eq(images.batchId, batchId))
    .orderBy(asc(images.createdAt), asc(images.id));
  return {
    batchId,
    rows: rows.map((row) => ({ ...row, thumbnailUrl: row.processingState === "uploading" ? null : thumbnailUrl(row.id) })),
  };
}
