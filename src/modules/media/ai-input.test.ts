import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { exiftool } from "exiftool-vendored";
import sharp from "sharp";
import { afterAll, beforeAll, expect, it } from "vitest";
import { makeJpeg, useTempFileStore, withTags } from "@/test/images";
import { makeAiInput } from "./ai-input";

let storeDir: string;
let workDir: string;
beforeAll(async () => {
  storeDir = await useTempFileStore();
  workDir = await mkdtemp(path.join(tmpdir(), "ai-input-"));
});
afterAll(async () => {
  await exiftool.end();
  await rm(storeDir, { recursive: true, force: true });
  await rm(workDir, { recursive: true, force: true });
});

async function storeOriginal(bytes: Buffer): Promise<string> {
  const id = crypto.randomUUID();
  await mkdir(path.join(storeDir, "originals"), { recursive: true });
  await writeFile(path.join(storeDir, "originals", id), bytes);
  return id;
}

it("is an upright 1568 px sRGB JPEG with no metadata at all (AD-16, SC-13)", async () => {
  const original = await withTags(await makeJpeg({ width: 4000, height: 3000, orientation: 6, icc: true }), "jpg", {
    "XMP-dc:Title": "Harbour",
    "IPTC:ObjectName": "Harbour",
    Make: "Canon",
    GPSLatitude: 63.4305,
    GPSLongitude: 10.3951,
  });
  const { bytes, mediaType } = await makeAiInput(await storeOriginal(original));

  expect(mediaType).toBe("image/jpeg");
  const meta = await sharp(bytes).metadata();
  expect(meta).toMatchObject({ format: "jpeg", width: 1176, height: 1568, space: "srgb" });
  expect(meta.orientation).toBeUndefined();
  expect(meta.icc).toBeUndefined();

  const file = path.join(workDir, "ai-input.jpg");
  await writeFile(file, bytes);
  const tags = await exiftool.readRaw(file, { readArgs: ["-a", "-G0"] });
  const groups = new Set(Object.keys(tags).filter((key) => key.includes(":")).map((key) => key.split(":")[0]));
  for (const group of ["EXIF", "XMP", "IPTC", "ICC_Profile", "MakerNotes"]) expect(groups.has(group)).toBe(false);
});

it("never enlarges a small image", async () => {
  const { bytes } = await makeAiInput(await storeOriginal(await makeJpeg({ width: 640, height: 480 })));
  expect(await sharp(bytes).metadata()).toMatchObject({ width: 640, height: 480 });
});
