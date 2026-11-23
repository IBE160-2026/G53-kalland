import { inArray, sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { fileVersions, images } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import type { Actor } from "@/modules/auth";
import { Forbidden } from "@/modules/shared/errors";
import { createTestClient } from "@/test/factories";
import { createLibraryImage } from "@/test/library-images";
import { loginAs } from "@/test/login-as";
import { createUploadRows, displayTitle, getLibraryImage, LIBRARY_PAGE_SIZE, listLibrary, saveAccess } from ".";

const db = getDb();
let ida: Actor;
let jonas: Actor;

beforeAll(async () => {
  ida = (await loginAs(fixtureUsers.ida)).actor;
  jonas = (await loginAs(fixtureUsers.jonas)).actor;
});

describe("displayTitle", () => {
  it.each([
    ["Harbour", "Harbour"],
    ["  Harbour  ", "Harbour"],
    [null, "Untitled image"],
    ["", "Untitled image"],
    ["   ", "Untitled image"],
  ])("gives %j as %j", (title, expected) => {
    expect(displayTitle(title)).toBe(expected);
  });
});

describe("listLibrary", () => {
  it("pages every image, drafts included, newest first, 48 a page; a page past the end gives the last page", async () => {
    // 49 rows in one insert; uuidv7 ids order them (Postgres 18 keeps them monotonic within a session).
    const { images: created } = await createUploadRows(db, ida, {
      filenames: Array.from({ length: 49 }, (_, i) => `paging-${i}.jpg`),
    });
    const mine = created.map((row) => row.id);

    const first = await listLibrary(ida, 1);
    expect(first.items).toHaveLength(LIBRARY_PAGE_SIZE);
    expect(first.total).toBeGreaterThanOrEqual(49);
    expect(first.pageCount).toBe(Math.ceil(first.total / LIBRARY_PAGE_SIZE));
    expect(first.pageCount).toBeGreaterThanOrEqual(2);
    expect(first.items.every((item) => item.status === "draft" || item.status === "published" || item.status === "archived")).toBe(true);

    // Newest first: by createdAt, then id, both descending. Compared in microseconds, the precision
    // Postgres sorts by (a JS Date keeps only milliseconds, so two rows can tie there).
    const rows = await db
      .select({ id: images.id, createdAtMicros: sql<string>`(extract(epoch from ${images.createdAt}) * 1000000)::bigint` })
      .from(images)
      .where(inArray(images.id, first.items.map((item) => item.id)));
    const createdAt = new Map(rows.map((row) => [row.id, BigInt(row.createdAtMicros)]));
    const order = first.items.map((item) => [createdAt.get(item.id)!, item.id] as const);
    const sorted = [...order].sort((a, b) => (a[0] !== b[0] ? (b[0] > a[0] ? 1 : -1) : a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0));
    expect(order).toEqual(sorted);
    const minePageOne = first.items.map((item) => item.id).filter((id) => mine.includes(id));
    expect(minePageOne[0]).toBe(mine[48]);
    expect(minePageOne).toEqual([...mine].reverse().slice(0, minePageOne.length));

    const last = await listLibrary(ida, 99_999);
    expect(last.page).toBe(last.pageCount);
    expect(last.items.length).toBeGreaterThan(0);
    expect((await listLibrary(ida, 0)).page).toBe(1);
  });

  it("shows the title or Untitled image, the file's size, and a restricted image's client names", async () => {
    const clientId = await createTestClient(`Wall Client ${crypto.randomUUID()}`);
    const untitled = await createLibraryImage(ida, { title: null });
    const restricted = await createLibraryImage(ida, { title: "Quay" });
    const [{ version }] = await db.select({ version: images.version }).from(images).where(inArray(images.id, [restricted]));
    await saveAccess(ida, restricted, { version, visibility: "restricted", priceTier: "paid", clients: { added: [clientId], removed: [] } });

    await db.insert(fileVersions).values({ imageId: restricted, hash: crypto.randomUUID(), mediaType: "image/jpeg", byteSize: 1, width: 300, height: 200 });

    const { items } = await listLibrary(ida, 1);
    expect(items.find((item) => item.id === untitled)).toMatchObject({ title: "Untitled image", clientNames: [], width: null, height: null });
    const item = items.find((i) => i.id === restricted);
    expect(item).toMatchObject({ title: "Quay", visibility: "restricted", priceTier: "paid", status: "draft", processingState: "ready", width: 300, height: 200 });
    expect(item?.clientNames).toHaveLength(1);
    expect(item?.clientNames[0]).toMatch(/^Wall Client /);
  });
});

describe("getLibraryImage", () => {
  it("returns the agency fields, keywords, clients and no missing fields for a complete draft", async () => {
    const id = await createLibraryImage(ida, { keywords: ["sea", "boat"] });
    expect(await getLibraryImage(ida, id)).toMatchObject({
      id,
      title: "Harbour",
      description: "Boats in a harbour.",
      altText: "Boats moored in a harbour.",
      keywords: ["boat", "sea"],
      clients: [],
      missingFields: [],
      version: 1,
    });
  });

  it("lists the missing agency fields in a fixed order", async () => {
    const lacking = await createLibraryImage(ida, { altText: null, keywords: [] });
    expect((await getLibraryImage(ida, lacking))?.missingFields).toEqual(["altText", "keywords"]);
    const empty = await createLibraryImage(ida, { title: "  ", description: null, altText: "", keywords: [] });
    expect((await getLibraryImage(ida, empty))?.missingFields).toEqual(["title", "description", "altText", "keywords"]);
  });

  it("returns null for an unknown image", async () => {
    expect(await getLibraryImage(ida, "019ab0c0-0000-7000-8000-00000000dead")).toBeNull();
  });
});

describe("the Library reads need a staff Actor", () => {
  it("throw Forbidden for a contact", async () => {
    const id = await createLibraryImage(ida);
    await expect(listLibrary(jonas, 1)).rejects.toBeInstanceOf(Forbidden);
    await expect(getLibraryImage(jonas, id)).rejects.toBeInstanceOf(Forbidden);
  });
});
