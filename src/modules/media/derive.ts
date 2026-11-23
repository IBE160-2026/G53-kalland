import sharp from "sharp";
import { MediaRejected } from "./errors";

const THUMBNAIL_EDGE = 480;
const PREVIEW_EDGE = 800;

export type DerivedImages = { thumbnail: Buffer; preview: Buffer; width: number; height: number };

function derive(file: string, edge: number): Promise<Buffer> {
  // Auto-orient first; keep only the ICC profile (AD-16). sharp drops all other metadata by default.
  return sharp(file)
    .autoOrient()
    .resize(edge, edge, { fit: "inside", withoutEnlargement: true })
    .keepIccProfile()
    .webp()
    .toBuffer();
}

// Makes the thumbnail (≤ 480 px long edge) and preview (≤ 800 px) of an original, and returns its
// oriented size. The original is only read. A file sharp cannot decode is `damaged`.
export async function deriveImages(file: string): Promise<DerivedImages> {
  try {
    const { autoOrient } = await sharp(file).metadata();
    const [thumbnail, preview] = await Promise.all([derive(file, THUMBNAIL_EDGE), derive(file, PREVIEW_EDGE)]);
    return { thumbnail, preview, width: autoOrient.width, height: autoOrient.height };
  } catch (error) {
    throw new MediaRejected("damaged", { cause: error });
  }
}
