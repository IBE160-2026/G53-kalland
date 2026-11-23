import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { exiftool } from "exiftool-vendored";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chunksOf, listFiles, makeJpeg, makePng, useTempFileStore, withTags } from "@/test/images";
import { deriveImages } from "./derive";
import { readEmbeddedMetadata } from "./embedded";
import { MediaRejected } from "./errors";
import { clearTempFiles } from "./files";
import { findLocationTags } from "./location-check";
import { MAX_UPLOAD_BYTES, receiveUpload } from "./receive";
import { sniffMediaType } from "./sniff";

let storeDir: string;
let workDir: string;
beforeAll(async () => {
  storeDir = await useTempFileStore();
  workDir = await mkdtemp(path.join(tmpdir(), "media-"));
});
afterAll(async () => {
  await exiftool.end();
  await rm(storeDir, { recursive: true, force: true });
  await rm(workDir, { recursive: true, force: true });
});

async function fileOf(name: string, bytes: Buffer): Promise<string> {
  const file = path.join(workDir, name);
  await writeFile(file, bytes);
  return file;
}

async function rejection(promise: Promise<unknown>): Promise<string> {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(MediaRejected);
  return (error as MediaRejected).reason;
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

describe("sniffMediaType", () => {
  it("decides by the first bytes", async () => {
    expect(sniffMediaType(await makeJpeg())).toBe("image/jpeg");
    expect(sniffMediaType(await makePng())).toBe("image/png");
    expect(sniffMediaType(Buffer.from("just some notes\n"))).toBeNull();
    expect(sniffMediaType(Buffer.from([0x89, 0x50, 0x4e]))).toBeNull();
    expect(sniffMediaType(Buffer.alloc(0))).toBeNull();
  });
});

describe("receiveUpload", () => {
  it("streams to tmp/<uuid> with the SHA-256 and size computed in-stream", async () => {
    const bytes = await makeJpeg({ width: 400, height: 300 });
    const received = await receiveUpload(chunksOf(bytes, 1000));
    expect(received.tmpKey).toMatch(/^tmp\/[0-9a-f-]{36}$/);
    expect(received).toMatchObject({ hash: sha256(bytes), byteSize: bytes.length, mediaType: "image/jpeg" });
    expect(sha256(await readFile(path.join(storeDir, received.tmpKey)))).toBe(sha256(bytes));
  });

  it("sniffs a type whose signature arrives split over chunks", async () => {
    const bytes = await makePng();
    const received = await receiveUpload(chunksOf(bytes, 3));
    expect(received.mediaType).toBe("image/png");
  });

  it("refuses a file over 50 MB while counting, and leaves nothing in tmp/", async () => {
    const before = await listFiles(storeDir);
    async function* oversized() {
      yield await makePng();
      const chunk = Buffer.alloc(1024 * 1024);
      for (let sent = 0; sent <= MAX_UPLOAD_BYTES; sent += chunk.length) yield chunk;
    }
    expect(await rejection(receiveUpload(oversized()))).toBe("tooLarge");
    expect(await listFiles(storeDir)).toEqual(before);
  });

  it("refuses content that is not JPEG or PNG, whatever it is called, and an empty body", async () => {
    const before = await listFiles(storeDir);
    expect(await rejection(receiveUpload(chunksOf(Buffer.from("notes.txt saved as x.jpg"))))).toBe("notImage");
    expect(await rejection(receiveUpload(chunksOf(Buffer.alloc(0))))).toBe("notImage");
    expect(await listFiles(storeDir)).toEqual(before);
  });

  it("leaves nothing in tmp/ when the body breaks off", async () => {
    const before = await listFiles(storeDir);
    async function* aborted() {
      yield (await makePng()).subarray(0, 100);
      throw new Error("aborted");
    }
    await expect(receiveUpload(aborted())).rejects.toThrow("aborted");
    expect(await listFiles(storeDir)).toEqual(before);
  });
});

describe("deriveImages", () => {
  it("auto-orients: an orientation-6 JPEG gives upright files and the oriented size", async () => {
    const file = await fileOf("rotated.jpg", await makeJpeg({ width: 40, height: 20, orientation: 6 }));
    const derived = await deriveImages(file);
    expect({ width: derived.width, height: derived.height }).toEqual({ width: 20, height: 40 });
    const thumbnail = await sharp(derived.thumbnail).metadata();
    expect(thumbnail).toMatchObject({ format: "webp", width: 20, height: 40 });
    expect(thumbnail.orientation).toBeUndefined();
  });

  it("makes a thumbnail of at most 480 px and a preview of at most 800 px on the long edge", async () => {
    const file = await fileOf("large.jpg", await makeJpeg({ width: 1600, height: 1000 }));
    const derived = await deriveImages(file);
    expect(await sharp(derived.thumbnail).metadata()).toMatchObject({ width: 480, height: 300 });
    expect(await sharp(derived.preview).metadata()).toMatchObject({ width: 800, height: 500 });
  });

  it("keeps only the ICC profile: no EXIF, IPTC or XMP, so no GPS", async () => {
    const tagged = await withTags(await makeJpeg({ icc: true }), "jpg", {
      "XMP-dc:Title": "Harbour",
      "IPTC:ObjectName": "Harbour",
      Make: "Canon",
      GPSLatitude: 59.9,
      GPSLongitude: 10.7,
    });
    const derived = await deriveImages(await fileOf("tagged.jpg", tagged));
    for (const [name, bytes] of [["thumbnail.webp", derived.thumbnail], ["preview.webp", derived.preview]] as const) {
      const tags = await exiftool.readRaw(await fileOf(name, bytes), { readArgs: ["-a", "-G0"] });
      const groups = new Set(Object.keys(tags).filter((key) => key.includes(":")).map((key) => key.split(":")[0]));
      expect(groups.has("ICC_Profile")).toBe(true);
      for (const group of ["EXIF", "IPTC", "XMP", "MakerNotes"]) expect(groups.has(group)).toBe(false);
    }
  });

  it("refuses a damaged file", async () => {
    const garbage = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.from("garbage ".repeat(200))]);
    expect(await rejection(deriveImages(await fileOf("damaged.jpg", garbage)))).toBe("damaged");
    const truncated = (await makePng(400, 300)).subarray(0, 200);
    expect(await rejection(deriveImages(await fileOf("truncated.png", truncated)))).toBe("damaged");
  });
});

describe("findLocationTags", () => {
  it("finds nothing in sharp's output of a file with GPS", async () => {
    const withGps = await withTags(await makeJpeg(), "jpg", { GPSLatitude: 59.9, GPSLongitude: 10.7, "XMP-photoshop:City": "Oslo" });
    const derived = await deriveImages(await fileOf("gps.jpg", withGps));
    expect(await findLocationTags(await fileOf("gps-thumbnail.webp", derived.thumbnail))).toEqual([]);
  });

  it("finds GPS planted in a derived file", async () => {
    const derived = await deriveImages(await fileOf("plain.jpg", await makeJpeg()));
    const planted = await withTags(derived.thumbnail, "webp", { GPSLatitude: 59.9, GPSLatitudeRef: "N" });
    expect(await findLocationTags(await fileOf("planted-gps.webp", planted))).toContain("GPS:GPSLatitude");
  });

  it("finds location text planted in a derived file", async () => {
    const derived = await deriveImages(await fileOf("plain2.jpg", await makeJpeg()));
    const planted = await withTags(derived.thumbnail, "webp", { "XMP-photoshop:City": "Oslo", "XMP-photoshop:Country": "Norway" });
    expect(await findLocationTags(await fileOf("planted-city.webp", planted))).toEqual(
      expect.arrayContaining(["XMP-photoshop:City", "XMP-photoshop:Country"]),
    );
  });
});

describe("readEmbeddedMetadata", () => {
  it("maps XMP, IPTC and EXIF to the image fields, XMP first", async () => {
    const bytes = await withTags(await makeJpeg(), "jpg", {
      "XMP-dc:Title": "Harbour at dawn",
      "IPTC:ObjectName": "IIM title",
      "XMP-dc:Description": "Boats in the harbour",
      "IPTC:Caption-Abstract": "IIM caption",
      ImageDescription: "EXIF description",
      "XMP-iptcCore:AltTextAccessibility": "Fishing boats moored at a quay at sunrise",
      "XMP-dc:Subject": ["Boat", "harbour", "boat", "Dawn"],
      "IPTC:Keywords": ["IIM keyword"],
      DateTimeOriginal: "2024:06:01 05:12:30",
      OffsetTimeOriginal: "+02:00",
      CreateDate: "2024:06:02 08:00:00",
      Make: "Canon",
      Model: "EOS R6",
      LensModel: "RF 24-70mm F2.8",
      ExposureTime: "1/250",
      FNumber: 8,
      ISO: 400,
      FocalLength: 35,
      GPSLatitude: -33.8568,
      GPSLongitude: 151.2153,
    });
    expect(await readEmbeddedMetadata(await fileOf("full.jpg", bytes))).toEqual({
      title: "Harbour at dawn",
      description: "Boats in the harbour",
      altText: "Fishing boats moored at a quay at sunrise",
      keywords: ["Boat", "harbour", "Dawn"],
      dateTaken: "2024-06-01 05:12:30",
      dateTakenOffset: "+02:00",
      cameraMake: "Canon",
      cameraModel: "EOS R6",
      lens: "RF 24-70mm F2.8",
      exposureTime: "1/250",
      fNumber: 8,
      focalLength: 35,
      iso: 400,
      latitude: -33.8568,
      longitude: 151.2153,
    });
  });

  it("falls back to IIM, then EXIF; strips control characters; cuts alt text to 250", async () => {
    const bytes = await withTags(await makeJpeg(), "jpg", {
      "IPTC:ObjectName": "Har\u0007bour\u001b view",
      ImageDescription: "EXIF only",
      "IPTC:Keywords": ["Quay", "QUAY", "Rope\u0007"],
      "XMP-iptcCore:AltTextAccessibility": "a".repeat(300),
      CreateDate: "2023:12:24 18:00:00",
    });
    expect(await readEmbeddedMetadata(await fileOf("fallback.jpg", bytes))).toMatchObject({
      title: "Harbour view",
      description: "EXIF only",
      altText: "a".repeat(250),
      keywords: ["Quay", "Rope"],
      dateTaken: "2023-12-24 18:00:00",
      dateTakenOffset: null,
    });
  });

  it("keeps line breaks in a description as \\n, and flattens a one-line title to single spaces", async () => {
    const bytes = await withTags(await makeJpeg(), "jpg", {
      "XMP-dc:Title": "Harbour\nat\tdawn",
      "XMP-dc:Description": "First line\nSecond line\r\nThird line",
    });
    expect(await readEmbeddedMetadata(await fileOf("lines.jpg", bytes))).toMatchObject({
      title: "Harbour at dawn",
      description: "First line\nSecond line\nThird line",
    });
  });

  it("gives empty fields for a file without metadata, and ignores an all-zero date", async () => {
    const bytes = await withTags(await makePng(), "png", { DateTimeOriginal: "0000:00:00 00:00:00" });
    expect(await readEmbeddedMetadata(await fileOf("plain.png", bytes))).toEqual({
      title: null,
      description: null,
      altText: null,
      keywords: [],
      dateTaken: null,
      dateTakenOffset: null,
      cameraMake: null,
      cameraModel: null,
      lens: null,
      exposureTime: null,
      fNumber: null,
      focalLength: null,
      iso: null,
      latitude: null,
      longitude: null,
    });
  });
});

describe("clearTempFiles", () => {
  it("empties tmp/ and leaves originals/ and derived/ untouched", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "sweep-store-"));
    const saved = process.env.FILE_STORE_DIR;
    process.env.FILE_STORE_DIR = dir;
    try {
      for (const key of ["tmp/a", "tmp/a-thumbnail", "originals/v1", "derived/v1/thumbnail", "derived/v1/preview"]) {
        await mkdir(path.dirname(path.join(dir, key)), { recursive: true });
        await writeFile(path.join(dir, key), "x");
      }
      await clearTempFiles();
      expect(await listFiles(dir)).toEqual(["derived/v1/preview", "derived/v1/thumbnail", "originals/v1"]);
    } finally {
      process.env.FILE_STORE_DIR = saved;
      await rm(dir, { recursive: true, force: true });
    }
  });
});
