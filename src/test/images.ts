import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { exiftool, type WriteTags } from "exiftool-vendored";
import sharp from "sharp";

// Test images, made on the fly so the repo holds no image files. Noise makes every image's bytes unique,
// so tests never collide on the unique hash index.
export async function makeJpeg(options: { width?: number; height?: number; orientation?: number; icc?: boolean } = {}): Promise<Buffer> {
  const { width = 64, height = 48, orientation, icc } = options;
  let image = sharp({ create: { width, height, channels: 3, background: "#808080", noise: { type: "gaussian", mean: 128, sigma: 40 } } });
  if (orientation) image = image.withMetadata({ orientation });
  if (icc) image = image.withIccProfile("p3");
  return image.jpeg().toBuffer();
}

export async function makePng(width = 64, height = 48): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: "#808080", noise: { type: "gaussian", mean: 128, sigma: 40 } } })
    .png()
    .toBuffer();
}

// Writes metadata into a copy of `bytes` with ExifTool and returns the new bytes.
// Tags are named as ExifTool names them, optionally with their group ("XMP-dc:Title").
export async function withTags(
  bytes: Buffer,
  extension: "jpg" | "png" | "webp",
  tags: Record<string, string | number | string[]>,
): Promise<Buffer> {
  const dir = await mkdtemp(path.join(tmpdir(), "tags-"));
  const file = path.join(dir, `image.${extension}`);
  try {
    await writeFile(file, bytes);
    await exiftool.write(file, tags as WriteTags, { writeArgs: ["-overwrite_original"] });
    return await readFile(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// A fresh FILE_STORE_DIR for one test file, so parallel test files never share tmp/.
export async function useTempFileStore(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "file-store-"));
  process.env.FILE_STORE_DIR = dir;
  return dir;
}

// Every file under a directory, as paths relative to it.
export async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)))
    .sort();
}

export async function* chunksOf(bytes: Buffer, size = 16 * 1024): AsyncGenerator<Uint8Array> {
  for (let i = 0; i < bytes.length; i += size) yield bytes.subarray(i, i + size);
}
