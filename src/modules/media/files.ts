import { Readable } from "node:stream";
import { log } from "@/modules/shared/log";
import { deriveImages } from "./derive";
import { readEmbeddedMetadata, type EmbeddedMetadata } from "./embedded";
import { MediaRejected } from "./errors";
import { getFileStore } from "./file-store";
import { findLocationTags } from "./location-check";
import type { ReceivedFile } from "./receive";

export type DerivedKind = "thumbnail" | "preview";

// An upload's files while they wait in tmp/ for the transaction that stores them (AD-11).
export type StagedUpload = ReceivedFile & { thumbnailKey: string; previewKey: string; width: number; height: number };

export function originalKey(fileVersionId: string): string {
  return `originals/${fileVersionId}`;
}

function finalKeys(fileVersionId: string) {
  return {
    original: originalKey(fileVersionId),
    thumbnail: `derived/${fileVersionId}/thumbnail`,
    preview: `derived/${fileVersionId}/preview`,
  };
}

// Makes the thumbnail and preview next to the received original in tmp/ and checks both against the
// location checklist (AD-16, AD-17). A hit fails the upload with `unsafePreview` and is logged.
export async function stageDerivedFiles(received: ReceivedFile): Promise<StagedUpload> {
  const store = getFileStore();
  const derived = await deriveImages(await store.localPath(received.tmpKey));
  const staged = {
    ...received,
    thumbnailKey: `${received.tmpKey}-thumbnail`,
    previewKey: `${received.tmpKey}-preview`,
    width: derived.width,
    height: derived.height,
  };
  await store.put(staged.thumbnailKey, Readable.from([derived.thumbnail]));
  await store.put(staged.previewKey, Readable.from([derived.preview]));
  for (const key of [staged.thumbnailKey, staged.previewKey]) {
    const hits = await findLocationTags(await store.localPath(key));
    if (hits.length > 0) {
      log.error({ tags: hits }, "A derived file carried location metadata; the upload was refused.");
      throw new MediaRejected("unsafePreview");
    }
  }
  return staged;
}

export async function readStagedMetadata(staged: ReceivedFile): Promise<EmbeddedMetadata> {
  return readEmbeddedMetadata(await getFileStore().localPath(staged.tmpKey));
}

// Moves the staged files to their final keys. The original is moved, never rewritten (NFR-10).
export async function storeStagedFiles(staged: StagedUpload, fileVersionId: string): Promise<void> {
  const store = getFileStore();
  const keys = finalKeys(fileVersionId);
  await store.move(staged.tmpKey, keys.original);
  await store.move(staged.thumbnailKey, keys.thumbnail);
  await store.move(staged.previewKey, keys.preview);
}

// Deletes whatever an upload left, in tmp/ and, once it has a file version id, at the final keys.
export async function discardUploadFiles(tmpKey: string, fileVersionId?: string): Promise<void> {
  const store = getFileStore();
  const keys = [tmpKey, `${tmpKey}-thumbnail`, `${tmpKey}-preview`];
  if (fileVersionId) keys.push(...Object.values(finalKeys(fileVersionId)));
  await Promise.all(keys.map((key) => store.delete(key)));
}

export async function openDerivedFile(fileVersionId: string, kind: DerivedKind): Promise<Readable> {
  return getFileStore().get(finalKeys(fileVersionId)[kind]);
}

// The startup sweep empties tmp/ (AD-11).
export async function clearTempFiles(): Promise<void> {
  await getFileStore().clearPrefix("tmp/");
}
