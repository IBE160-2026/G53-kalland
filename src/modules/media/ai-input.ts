import sharp from "sharp";
import { getFileStore } from "./file-store";
import { originalKey } from "./files";

const AI_INPUT_EDGE = 1568;

// Makes the AI input from a stored original (AD-16): auto-oriented, at most 1568 px on the long edge
// (never enlarged), sRGB JPEG with no metadata at all — sharp drops it by default and nothing asks to
// keep it. Made in memory for one generation and never stored.
export async function makeAiInput(fileVersionId: string): Promise<{ bytes: Buffer; mediaType: "image/jpeg" }> {
  const file = await getFileStore().localPath(originalKey(fileVersionId));
  const bytes = await sharp(file)
    .autoOrient()
    .resize(AI_INPUT_EDGE, AI_INPUT_EDGE, { fit: "inside", withoutEnlargement: true })
    .toColourspace("srgb")
    .jpeg()
    .toBuffer();
  return { bytes, mediaType: "image/jpeg" };
}
