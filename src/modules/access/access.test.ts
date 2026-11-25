import { rm } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { exiftool } from "exiftool-vendored";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { fileVersions, imageClients, images, licences } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import type { Actor } from "@/modules/auth";
import { completeUpload, createUploadRows } from "@/modules/images";
import { currentLicenceType, grantLicence } from "@/modules/licences";
import { Forbidden } from "@/modules/shared/errors";
import { createTestClient, createTestContact } from "@/test/factories";
import { chunksOf, makeJpeg, useTempFileStore } from "@/test/images";
import { createLibraryImage } from "@/test/library-images";
import { loginAs } from "@/test/login-as";
import { clientMaySeeLocation, getClientImage, listClientImages, type ClientImage } from ".";

const db = getDb();
let ida: Actor;
let storeDir: string;
// Two fresh clients (AD-7): "listed" is on every restricted list below except A7's, which lists "other".
const contacts = {} as Record<"listed" | "other", Actor>;
let clientIds: Record<"listed" | "other", string>;

type Row = {
  row: string;
  status: "draft" | "published" | "archived";
  visibility: "internal" | "restricted" | "public";
  clients: ("listed" | "other")[];
  priceTier: "free" | "paid";
  // The listed client holds an active licence for it.
  licensed?: true;
};

// The access table (AD-6, AD-7). The licensed rows are licensed to the "listed" client only.
const ROWS: Row[] = [
  { row: "A1", status: "published", visibility: "public", clients: [], priceTier: "free" },
  { row: "A2", status: "published", visibility: "public", clients: [], priceTier: "paid" },
  { row: "A3", status: "published", visibility: "public", clients: [], priceTier: "paid", licensed: true },
  { row: "A4", status: "published", visibility: "restricted", clients: ["listed"], priceTier: "free" },
  { row: "A5", status: "published", visibility: "restricted", clients: ["listed"], priceTier: "paid" },
  { row: "A6", status: "published", visibility: "restricted", clients: ["listed"], priceTier: "paid", licensed: true },
  { row: "A7", status: "published", visibility: "restricted", clients: ["other"], priceTier: "free" },
  { row: "A8", status: "published", visibility: "restricted", clients: ["other"], priceTier: "paid", licensed: true },
  { row: "A9", status: "published", visibility: "internal", clients: [], priceTier: "free" },
  { row: "A10", status: "published", visibility: "internal", clients: [], priceTier: "paid", licensed: true },
  { row: "A11", status: "archived", visibility: "public", clients: [], priceTier: "free" },
  { row: "A12", status: "archived", visibility: "public", clients: [], priceTier: "paid", licensed: true },
  { row: "A13", status: "draft", visibility: "public", clients: [], priceTier: "free" },
  { row: "S4", status: "published", visibility: "restricted", clients: [], priceTier: "free" },
];

type Expected = null | { own: boolean; canDownload: boolean; canBuy: boolean };
const HIDDEN: Expected = null;
const OWN: Expected = { own: true, canDownload: true, canBuy: false };
const BUYABLE: Expected = { own: false, canDownload: false, canBuy: true };

// What each client gets, by row: null = not visible (404, absent from lists and counts).
const EXPECTED: Record<string, Record<"listed" | "other", Expected>> = {
  A1: { listed: { own: false, canDownload: true, canBuy: false }, other: { own: false, canDownload: true, canBuy: false } },
  A2: { listed: BUYABLE, other: BUYABLE },
  A3: { listed: OWN, other: BUYABLE },
  A4: { listed: OWN, other: HIDDEN },
  A5: { listed: BUYABLE, other: HIDDEN },
  A6: { listed: OWN, other: HIDDEN },
  A7: { listed: HIDDEN, other: OWN },
  A8: { listed: OWN, other: BUYABLE },
  A9: { listed: HIDDEN, other: HIDDEN },
  A10: { listed: OWN, other: HIDDEN },
  A11: { listed: HIDDEN, other: HIDDEN },
  A12: { listed: OWN, other: HIDDEN },
  A13: { listed: HIDDEN, other: HIDDEN },
  S4: { listed: HIDDEN, other: HIDDEN },
};

const ids = new Map<string, string>();

const CLIENT_IMAGE_KEYS = [
  "id",
  "title",
  "description",
  "altText",
  "keywords",
  "dateTaken",
  "cameraMake",
  "cameraModel",
  "lens",
  "exposureTime",
  "fNumber",
  "focalLength",
  "iso",
  "width",
  "height",
  "price",
  "fileVersionId",
  "own",
  "canDownload",
  "canBuy",
];

async function createRow(row: Row): Promise<string> {
  const id = await createLibraryImage(ida, {
    status: row.status,
    visibility: row.visibility,
    priceTier: row.priceTier,
    title: `Access ${row.row}`,
    publishedAt: row.status === "draft" ? null : new Date(),
  });
  // GPS on every row, so the location check below has something to leak.
  await db.update(images).set({ latitude: 69.6489, longitude: 18.9553 }).where(eq(images.id, id));
  if (row.clients.length > 0) {
    await db.insert(imageClients).values(row.clients.map((key) => ({ imageId: id, clientId: clientIds[key] })));
  }
  if (row.licensed) await grant(contacts.listed, id);
  return id;
}

// A licence through the one grant path (AD-18), at the current price.
async function grant(actor: Actor, imageId: string) {
  const type = (await currentLicenceType(db))!;
  return db.transaction((tx) =>
    grantLicence(tx, actor, { imageId, source: "purchase", licenceTypeId: type.id, priceMinor: type.priceMinor, currency: type.currency }),
  );
}

// Every page of the contact's Find images list.
async function listAll(actor: Actor): Promise<{ items: ClientImage[]; total: number }> {
  const first = await listClientImages(actor, 1);
  const items = [...first.items];
  for (let page = 2; page <= first.pageCount; page += 1) items.push(...(await listClientImages(actor, page)).items);
  return { items, total: first.total };
}

beforeAll(async () => {
  storeDir = await useTempFileStore();
  ida = (await loginAs(fixtureUsers.ida)).actor;
  clientIds = { listed: await createTestClient("Listed Client AS"), other: await createTestClient("Other Client AS") };
  for (const key of ["listed", "other"] as const) {
    const { userId, clientId } = await createTestContact(clientIds[key]);
    contacts[key] = { userId, role: "contact", clientId };
  }
  for (const row of ROWS) ids.set(row.row, await createRow(row));
});

afterAll(async () => {
  await exiftool.end();
  await rm(storeDir, { recursive: true, force: true });
});

describe("the access table", () => {
  const cases = ROWS.flatMap((row) => (["listed", "other"] as const).map((client) => [row.row, client] as const));

  it.each(cases)("%s for the %s client: getClientImage and the list agree with the table", async (row, client) => {
    const expected = EXPECTED[row][client];
    const image = await getClientImage(contacts[client], ids.get(row)!);
    const listed = (await listAll(contacts[client])).items.find((item) => item.id === ids.get(row));
    if (expected === null) {
      expect(image).toBeNull();
      expect(listed).toBeUndefined();
    } else {
      expect(image).toMatchObject(expected);
      expect(listed).toEqual(image);
    }
  });

  it("counts exactly the visible rows: the listed client sees A4, A5, A6, A10 and A12 that the other does not, the other A7", async () => {
    // Other test files publish public images concurrently, which both totals include. An attempt counts
    // only when each client's total is the same before and after the other's read, so no publish fell
    // between the two reads compared.
    let difference: number | null = null;
    for (let attempt = 0; attempt < 5 && difference === null; attempt += 1) {
      const other = (await listClientImages(contacts.other, 1)).total;
      const listed = (await listClientImages(contacts.listed, 1)).total;
      const otherAgain = (await listClientImages(contacts.other, 1)).total;
      const listedAgain = (await listClientImages(contacts.listed, 1)).total;
      if (other === otherAgain && listed === listedAgain) difference = listed - other;
    }
    expect(difference).toBe(4);
  });

  it("a revoked licence no longer makes an image own: a public paid one is buyable again, an internal one hidden", async () => {
    const publicPaid = await createRow({ row: "revoked public", status: "published", visibility: "public", clients: [], priceTier: "paid" });
    const internalPaid = await createRow({ row: "revoked internal", status: "published", visibility: "internal", clients: [], priceTier: "paid" });
    for (const imageId of [publicPaid, internalPaid]) {
      const { licence } = await grant(contacts.listed, imageId);
      expect(await getClientImage(contacts.listed, imageId)).toMatchObject(OWN!);
      await db.update(licences).set({ revokedAt: new Date() }).where(eq(licences.id, licence.id));
    }
    expect(await getClientImage(contacts.listed, publicPaid)).toMatchObject(BUYABLE!);
    expect(await getClientImage(contacts.listed, internalPaid)).toBeNull();
  });
});

describe("listClientImages", () => {
  it("lists newest first, and a page past the end gives the last page", async () => {
    const { items } = await listAll(contacts.listed);
    const order = items.map((item) => item.id).filter((id) => ["A1", "A2", "A4", "A5"].some((row) => ids.get(row) === id));
    expect(order).toEqual(["A5", "A4", "A2", "A1"].map((row) => ids.get(row)));

    const last = await listClientImages(contacts.listed, 9999);
    expect(last.page).toBe(last.pageCount);
    expect(last.items.length).toBeGreaterThan(0);
  });

  it("is refused to staff", async () => {
    await expect(listClientImages(ida, 1)).rejects.toThrow(Forbidden);
    await expect(getClientImage(ida, ids.get("A1")!)).rejects.toThrow(Forbidden);
  });
});

describe("getClientImage", () => {
  it("returns null for an id that does not exist or is not a UUID", async () => {
    expect(await getClientImage(contacts.listed, crypto.randomUUID())).toBeNull();
    expect(await getClientImage(contacts.listed, "not-a-uuid")).toBeNull();
  });

  it("builds the ClientImage from the fixed field list, with no location, client list or staff fields", async () => {
    const image = (await getClientImage(contacts.listed, ids.get("A4")!))!;
    expect(Object.keys(image).sort()).toEqual([...CLIENT_IMAGE_KEYS].sort());
    const json = JSON.stringify(image);
    for (const leak of ["69.6489", "18.9553", "Listed Client AS", "Other Client AS", "library-", "staff", "restricted"]) {
      expect(json).not.toContain(leak);
    }
    expect(image).toMatchObject({ title: "Access A4", description: "Boats in a harbour.", keywords: ["harbour"], price: "free" });
  });

  it("gives a paid image the current licence type's price, and an untitled image the fallback title", async () => {
    const type = (await currentLicenceType(db))!;
    const image = await getClientImage(contacts.listed, ids.get("A2")!);
    expect(image?.price).toEqual({ licenceTypeId: type.id, priceMinor: 9000, currency: "USD" });

    const untitled = await createLibraryImage(ida, { status: "published", visibility: "public", title: null, publishedAt: new Date() });
    expect((await getClientImage(contacts.listed, untitled))?.title).toBe("Untitled image");
  });

  it("gives the latest file version's id and oriented size", async () => {
    const bytes = await makeJpeg({ width: 64, height: 48 });
    const {
      images: [row],
    } = await createUploadRows(db, ida, { filenames: ["access-upload.jpg"] });
    await completeUpload(ida, row.id, chunksOf(bytes), bytes.length);
    await db.update(images).set({ status: "published", visibility: "public", publishedAt: new Date() }).where(eq(images.id, row.id));
    const [version] = await db.select({ id: fileVersions.id }).from(fileVersions).where(eq(fileVersions.imageId, row.id));

    expect(await getClientImage(contacts.other, row.id)).toMatchObject({ fileVersionId: version.id, width: 64, height: 48 });
    expect(await getClientImage(contacts.other, ids.get("A1")!)).toMatchObject({ fileVersionId: null, width: null, height: null });
  });
});

it("clientMaySeeLocation is false in v1", () => {
  expect(clientMaySeeLocation()).toBe(false);
});
