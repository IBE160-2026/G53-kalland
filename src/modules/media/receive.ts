import { createHash, randomUUID } from "node:crypto";
import { MediaRejected } from "./errors";
import { getFileStore } from "./file-store";
import { SNIFF_BYTES, sniffMediaType, type ImageMediaType } from "./sniff";

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export type ReceivedFile = { tmpKey: string; hash: string; byteSize: number; mediaType: ImageMediaType };

// Streams an upload to `tmp/<uuid>` (AD-11), computing its SHA-256 and size in-stream. Stops with
// `tooLarge` as soon as the count passes the limit, and with `notImage` when the first bytes are not
// JPEG or PNG. Nothing stays in tmp/ when it fails, also when the body breaks off (an aborted upload).
export async function receiveUpload(body: AsyncIterable<Uint8Array>, maxBytes = MAX_UPLOAD_BYTES): Promise<ReceivedFile> {
  const tmpKey = `tmp/${randomUUID()}`;
  const hash = createHash("sha256");
  const state: { byteSize: number; head: Buffer; mediaType: ImageMediaType | null } = {
    byteSize: 0,
    head: Buffer.alloc(0),
    mediaType: null,
  };

  function sniff(final: boolean): void {
    if (state.mediaType || (!final && state.head.length < SNIFF_BYTES)) return;
    state.mediaType = sniffMediaType(state.head);
    if (!state.mediaType) throw new MediaRejected("notImage");
  }

  async function* checked(): AsyncGenerator<Uint8Array> {
    for await (const chunk of body) {
      state.byteSize += chunk.length;
      if (state.byteSize > maxBytes) throw new MediaRejected("tooLarge");
      if (!state.mediaType) {
        state.head = Buffer.concat([state.head, chunk]).subarray(0, SNIFF_BYTES);
        sniff(false);
      }
      hash.update(chunk);
      yield chunk;
    }
    sniff(true);
  }

  await getFileStore().put(tmpKey, checked());
  if (!state.mediaType) throw new MediaRejected("notImage");
  return { tmpKey, hash: hash.digest("hex"), byteSize: state.byteSize, mediaType: state.mediaType };
}
