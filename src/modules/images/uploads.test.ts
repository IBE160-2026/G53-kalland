import { createHash } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { exiftool } from "exiftool-vendored";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import messages from "../../../messages/en.json";
import { getDb } from "@/db/client";
import { batches, fileVersions, imageKeywords, images } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import type { Actor } from "@/modules/auth";
import { Conflict, Forbidden } from "@/modules/shared/errors";
import { chunksOf, listFiles, makeJpeg, makePng, useTempFileStore, withTags } from "@/test/images";
import { loginAs } from "@/test/login-as";
import {
  completeUpload,
  createUploadRows,
  getThumbnail,
  listBatchUploads,
  STALE_UPLOAD_MS,
  sweepStaleUploads,
  UploadRejected,
  type UploadRejectionReason,
} from "./uploads";

// Plants a location hit in a derived file on demand (AD-17), without touching the real check otherwise.
const plant = vi.hoisted(() => ({ locationHit: false }));
vi.mock("@/modules/media/location-check", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/modules/media/location-check")>();
  return {
    findLocationTags: async (file: string) => (plant.locationHit ? ["GPS:GPSLatitude"] : original.findLocationTags(file)),
  };
});

const db = getDb();
let storeDir: string;
let ida: Actor;
let per: Actor;
let jonas: Actor;

beforeAll(async () => {
  storeDir = await useTempFileStore();
  ida = (await loginAs(fixtureUsers.ida)).actor;
  per = (await loginAs(fixtureUsers.per)).actor;
  jonas = (await loginAs(fixtureUsers.jonas)).actor;
});
beforeEach(() => {
  plant.locationHit = false;
});
afterAll(async () => {
  await exiftool.end();
  await rm(storeDir, { recursive: true, force: true });
});

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function oneRow(actor = ida, filename = "harbour.jpg") {
  const { batchId, images: rows } = await createUploadRows(db, actor, { filenames: [filename] });
  return { batchId, imageId: rows[0].id };
}

async function imageRow(imageId: string) {
  const [row] = await db.select().from(images).where(eq(images.id, imageId));
  return row;
}

async function tmpFiles(): Promise<string[]> {
  return (await listFiles(storeDir)).filter((file) => file.startsWith("tmp"));
}

async function rejectionOf(promise: Promise<unknown>): Promise<UploadRejectionReason> {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(UploadRejected);
  return (error as UploadRejected).reason;
}

describe("createUploadRows", () => {
  it("creates a batch owned by the actor and one uploading draft per file, with the batch defaults copied", async () => {
    const { batchId, images: rows } = await createUploadRows(db, ida, { filenames: ["a.jpg", "b.png"] });
    expect(rows.map((row) => row.filename)).toEqual(["a.jpg", "b.png"]);
    const [batch] = await db.select().from(batches).where(eq(batches.id, batchId));
    expect(batch).toMatchObject({ ownerId: ida.userId, visibility: "internal", priceTier: "free" });
    for (const { id } of rows) {
      expect(await imageRow(id)).toMatchObject({
        batchId,
        uploadedBy: ida.userId,
        status: "draft",
        processingState: "uploading",
        visibility: "internal",
        priceTier: "free",
      });
    }
  });

  it("adds rows to the actor's own batch, copying that batch's current defaults", async () => {
    const { batchId } = await oneRow();
    await db.update(batches).set({ visibility: "public", priceTier: "paid" }).where(eq(batches.id, batchId));
    const { images: rows } = await createUploadRows(db, ida, { batchId, filenames: ["c.jpg"] });
    expect(await imageRow(rows[0].id)).toMatchObject({ batchId, visibility: "public", priceTier: "paid" });
  });

  it("refuses a contact, and another staff user's batch", async () => {
    await expect(createUploadRows(db, jonas, { filenames: ["a.jpg"] })).rejects.toThrow(Forbidden);
    const { batchId } = await oneRow(ida);
    await expect(createUploadRows(db, per, { batchId, filenames: ["a.jpg"] })).rejects.toThrow(Forbidden);
  });
});

describe("completeUpload", () => {
  it("stores a ready draft with its embedded metadata, file version and files (NFR-10)", async () => {
    const bytes = await withTags(await makeJpeg({ width: 1200, height: 900 }), "jpg", {
      "XMP-dc:Title": "Harbour",
      "XMP-dc:Subject": ["Boat", "Sea"],
      DateTimeOriginal: "2024:06:01 05:12:30",
      Make: "Canon",
      GPSLatitude: 63.4305,
      GPSLongitude: 10.3951,
    });
    const { imageId } = await oneRow();
    const result = await completeUpload(ida, imageId, chunksOf(bytes), bytes.length);
    expect(result).toEqual({ title: "Harbour", thumbnailUrl: `/api/images/${imageId}/thumbnail` });

    expect(await imageRow(imageId)).toMatchObject({
      status: "draft",
      processingState: "ready",
      visibility: "internal",
      priceTier: "free",
      title: "Harbour",
      titleSource: "embedded",
      description: null,
      descriptionSource: null,
      dateTaken: "2024-06-01 05:12:30",
      cameraMake: "Canon",
      latitude: 63.4305,
      longitude: 10.3951,
    });
    const keywords = await db.select().from(imageKeywords).where(eq(imageKeywords.imageId, imageId));
    expect(keywords.map((k) => [k.keyword, k.source])).toEqual([
      ["Boat", "embedded"],
      ["Sea", "embedded"],
    ]);

    const [version] = await db.select().from(fileVersions).where(eq(fileVersions.imageId, imageId));
    expect(version).toMatchObject({ hash: sha256(bytes), mediaType: "image/jpeg", byteSize: bytes.length, width: 1200, height: 900 });
    // The stored original is the uploaded file, byte for byte, under a key that never uses its name.
    expect(sha256(await readFile(path.join(storeDir, "originals", version.id)))).toBe(sha256(bytes));
    expect(await listFiles(storeDir)).toEqual(
      expect.arrayContaining([`originals/${version.id}`, `derived/${version.id}/thumbnail`, `derived/${version.id}/preview`]),
    );
    expect((await listFiles(storeDir)).some((file) => file.includes("harbour"))).toBe(false);
    expect(await tmpFiles()).toEqual([]);
  });

  it("stores a PNG without metadata with empty fields", async () => {
    const bytes = await makePng();
    const { imageId } = await oneRow(ida, "plain.png");
    expect(await completeUpload(ida, imageId, chunksOf(bytes), bytes.length)).toMatchObject({ title: null });
    expect(await imageRow(imageId)).toMatchObject({ processingState: "ready", title: null, titleSource: null });
  });

  it.each([
    ["notImage", () => Buffer.from("notes.txt saved as x.jpg")],
    ["damaged", () => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.from("garbage ".repeat(200))])],
  ] as const)("rejects a %s file and deletes its row and files", async (reason, bytes) => {
    const { imageId } = await oneRow(ida, "x.jpg");
    expect(await rejectionOf(completeUpload(ida, imageId, chunksOf(bytes()), null))).toBe(reason);
    expect(await imageRow(imageId)).toBeUndefined();
    expect(await tmpFiles()).toEqual([]);
  });

  it("rejects a Content-Length over 50 MB before reading the body", async () => {
    const { imageId } = await oneRow();
    const body = {
      [Symbol.asyncIterator]() {
        throw new Error("the body must not be read");
      },
    };
    expect(await rejectionOf(completeUpload(ida, imageId, body, 51 * 1024 * 1024))).toBe("tooLarge");
    expect(await imageRow(imageId)).toBeUndefined();
  });

  it("rejects a byte-identical file through the unique hash index, deleting the row and its files", async () => {
    const bytes = await makeJpeg();
    const first = await oneRow();
    await completeUpload(ida, first.imageId, chunksOf(bytes), bytes.length);
    const filesBefore = await listFiles(storeDir);

    const second = await oneRow();
    expect(await rejectionOf(completeUpload(ida, second.imageId, chunksOf(bytes), bytes.length))).toBe("duplicate");
    expect(await imageRow(second.imageId)).toBeUndefined();
    expect(await imageRow(first.imageId)).toMatchObject({ processingState: "ready" });
    expect(await listFiles(storeDir)).toEqual(filesBefore);
  });

  it("fails on a location hit in a derived file, deleting the row and files", async () => {
    plant.locationHit = true;
    const bytes = await makeJpeg();
    const { imageId } = await oneRow();
    expect(await rejectionOf(completeUpload(ida, imageId, chunksOf(bytes), bytes.length))).toBe("unsafePreview");
    expect(await imageRow(imageId)).toBeUndefined();
    expect(await tmpFiles()).toEqual([]);
  });

  it("cleans up when the upload breaks off mid-stream", async () => {
    const bytes = await makeJpeg({ width: 800, height: 600 });
    async function* aborted() {
      yield bytes.subarray(0, 1000);
      throw new Error("aborted");
    }
    const { imageId } = await oneRow();
    await expect(completeUpload(ida, imageId, aborted(), bytes.length)).rejects.toThrow("aborted");
    expect(await imageRow(imageId)).toBeUndefined();
    expect(await tmpFiles()).toEqual([]);
  });

  it("refuses a contact, and another staff user's row, without touching it", async () => {
    const bytes = await makeJpeg();
    const { imageId } = await oneRow(ida);
    await expect(completeUpload(jonas, imageId, chunksOf(bytes), bytes.length)).rejects.toThrow(Forbidden);
    await expect(completeUpload(per, imageId, chunksOf(bytes), bytes.length)).rejects.toThrow(Forbidden);
    expect(await imageRow(imageId)).toMatchObject({ processingState: "uploading" });
  });
});

describe("a second upload to a ready image", () => {
  it.each([
    ["a valid image", () => makeJpeg()],
    ["a non-image", async () => Buffer.from("not an image")],
  ])("with %s is a Conflict and changes nothing", async (_name, body) => {
    const bytes = await makePng();
    const { imageId } = await oneRow();
    await completeUpload(ida, imageId, chunksOf(bytes), bytes.length);
    const rowBefore = await imageRow(imageId);
    const filesBefore = await listFiles(storeDir);

    const second = await body();
    await expect(completeUpload(ida, imageId, chunksOf(second), second.length)).rejects.toThrow(Conflict);
    expect(await imageRow(imageId)).toEqual(rowBefore);
    const versions = await db.select().from(fileVersions).where(eq(fileVersions.imageId, imageId));
    expect(versions.map((v) => v.hash)).toEqual([sha256(bytes)]);
    expect(await listFiles(storeDir)).toEqual(filesBefore);
  });
});

describe("sweepStaleUploads", () => {
  it("deletes uploading rows untouched for more than an hour, and nothing else", async () => {
    const now = new Date();
    const stale = await oneRow();
    const recent = await oneRow();
    const done = await oneRow();
    const png = await makePng();
    await completeUpload(ida, done.imageId, chunksOf(png), png.length);
    const age = (ms: number) => sql`${now.toISOString()}::timestamptz - make_interval(secs => ${ms / 1000})`;
    await db.update(images).set({ updatedAt: age(STALE_UPLOAD_MS + 60_000) }).where(eq(images.id, stale.imageId));
    await db.update(images).set({ updatedAt: age(STALE_UPLOAD_MS - 60_000) }).where(eq(images.id, recent.imageId));
    await db.update(images).set({ updatedAt: age(STALE_UPLOAD_MS + 60_000) }).where(eq(images.id, done.imageId));

    // Not the count: instrumentation.test.ts may sweep the same stale row in parallel.
    await sweepStaleUploads(now);
    expect(await imageRow(stale.imageId)).toBeUndefined();
    expect(await imageRow(recent.imageId)).toMatchObject({ processingState: "uploading" });
    expect(await imageRow(done.imageId)).toMatchObject({ processingState: "ready" });
  });
});

describe("reads", () => {
  it("getThumbnail streams the WebP thumbnail to staff only", async () => {
    const bytes = await makeJpeg();
    const { imageId } = await oneRow();
    await completeUpload(ida, imageId, chunksOf(bytes), bytes.length);
    const chunks: Buffer[] = [];
    for await (const chunk of await getThumbnail(per, imageId)) chunks.push(chunk as Buffer);
    expect(Buffer.concat(chunks).subarray(8, 12).toString()).toBe("WEBP");
    await expect(getThumbnail(jonas, imageId)).rejects.toThrow(Forbidden);
  });

  it("listBatchUploads lists the actor's own batch in upload order, and nothing for anyone else's", async () => {
    const { batchId, images: rows } = await createUploadRows(db, ida, { filenames: ["one.png", "two.png"] });
    const png = await makePng();
    await completeUpload(ida, rows[1].id, chunksOf(png), png.length);
    expect(await listBatchUploads(ida, batchId)).toEqual({
      batchId,
      rows: [
        { id: rows[0].id, filename: "one.png", title: null, processingState: "uploading", thumbnailUrl: null },
        { id: rows[1].id, filename: "two.png", title: null, processingState: "ready", thumbnailUrl: `/api/images/${rows[1].id}/thumbnail` },
      ],
    });
    expect(await listBatchUploads(per, batchId)).toBeNull();
    expect(await listBatchUploads(ida, "019ab0c0-0000-7000-8000-00000000dead")).toBeNull();
    await expect(listBatchUploads(jonas, batchId)).rejects.toThrow(Forbidden);
  });
});

describe("NFR-7 rejection messages", () => {
  it("are word for word as specified, with the file name", () => {
    const rejected = messages.upload.rejected;
    expect(rejected).toEqual({
      notImage: "{name} was not uploaded: it is not a JPEG or PNG image.",
      tooLarge: "{name} was not uploaded: it is larger than 50 MB.",
      damaged: "{name} was not uploaded: the file is damaged.",
      duplicate: "{name} is already in the library.",
      unsafePreview: "{name} was not uploaded: its preview could not be made safely. Try again.",
      connectionLost: "{name} was not uploaded: the connection was lost. Add the file again.",
    });
    const reasons: UploadRejectionReason[] = ["notImage", "tooLarge", "damaged", "duplicate", "unsafePreview"];
    for (const reason of reasons) expect(new UploadRejected(reason).messageKey).toBe(`upload.rejected.${reason}`);
  });
});
