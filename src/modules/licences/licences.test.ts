import { and, eq, sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { imageClients, images, licences, licenceTexts, licenceTypes } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import { DEFAULT_TENANT_ID } from "@/db/tenant";
import type { Actor } from "@/modules/auth";
import { Forbidden } from "@/modules/shared/errors";
import { createTestClient, createTestContact } from "@/test/factories";
import { createLibraryImage } from "@/test/library-images";
import { loginAs } from "@/test/login-as";
import {
  checkOut,
  currentLicenceText,
  currentLicenceType,
  ensureStandardLicenceType,
  formatAmount,
  formatPrice,
  getClientLicence,
  grantLicence,
  listLicences,
  type LicenceType,
} from ".";

const db = getDb();

async function counts() {
  const [types] = await db.select({ n: sql<number>`count(*)::int` }).from(licenceTypes);
  const [texts] = await db.select({ n: sql<number>`count(*)::int` }).from(licenceTexts);
  return { types: types.n, texts: texts.n };
}

describe("ensureStandardLicenceType", () => {
  // The Vitest global setup has already seeded the test database once.
  it("leaves exactly one licence type with text version 1, however often and concurrently it runs", async () => {
    await Promise.all([ensureStandardLicenceType(db), ensureStandardLicenceType(db), ensureStandardLicenceType(db)]);
    await db.transaction((tx) => ensureStandardLicenceType(tx));
    expect(await counts()).toEqual({ types: 1, texts: 1 });

    const type = await currentLicenceType(db);
    expect(type).toMatchObject({ name: "Standard commercial use", priceMinor: 9000, currency: "USD" });
    const texts = await db.select({ version: licenceTexts.version, body: licenceTexts.body }).from(licenceTexts).where(eq(licenceTexts.licenceTypeId, type!.id));
    expect(texts).toHaveLength(1);
    expect(texts[0].version).toBe(1);
    expect(texts[0].body.length).toBeGreaterThan(0);
  });
});

describe("currentLicenceText", () => {
  it("returns the id and body of the latest text version, and null for a type without text", async () => {
    const type = await currentLicenceType(db);
    const v1 = await currentLicenceText(db, type!.id);
    expect(v1?.body).toMatch(/^The client may use the image/);
    expect(v1?.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await currentLicenceText(db, crypto.randomUUID())).toBeNull();

    // Version 2 inside a transaction that is rolled back, so other test files never see it.
    const rollback = new Error("rollback");
    await expect(
      db.transaction(async (tx) => {
        await tx.insert(licenceTexts).values({ licenceTypeId: type!.id, version: 2, body: "Version two." });
        expect((await currentLicenceText(tx, type!.id))?.body).toBe("Version two.");
        throw rollback;
      }),
    ).rejects.toBe(rollback);
    expect(await currentLicenceText(db, type!.id)).toEqual(v1);
  });
});

describe("formatPrice", () => {
  it.each([
    [9000, "90 USD"],
    [0, "0 USD"],
    [9050, "90.50 USD"],
    [9005, "90.05 USD"],
    [99, "0.99 USD"],
  ])("formats %i minor units as %s", (minor, expected) => {
    expect(formatPrice(minor, "USD")).toBe(expected);
  });

  it.each([-1, 1.5, Number.NaN])("refuses %d", (minor) => {
    expect(() => formatPrice(minor, "USD")).toThrow(RangeError);
    expect(() => formatAmount(minor)).toThrow(RangeError);
  });

  it("gives the amount in major units without the currency, for the NFR-7 price message", () => {
    expect(formatAmount(9000)).toBe("90");
    expect(formatAmount(12050)).toBe("120.50");
  });
});

// Story 1.9: the grant path, single-image checkout and the logs. Every test uses fresh clients, contacts
// and images (AD-7), so other test files never see these licences change their access rows.
let ida: Actor;
let type: LicenceType;

// A contact of a fresh client, or of the given one.
async function newContact(clientId?: string): Promise<Extract<Actor, { role: "contact" }>> {
  const contact = await createTestContact(clientId ?? (await createTestClient("Licence Client AS")));
  return { userId: contact.userId, role: "contact", clientId: contact.clientId };
}

// A published image in the given state, titled uniquely.
async function newImage(state: { visibility?: "internal" | "restricted" | "public"; priceTier?: "free" | "paid"; title?: string | null } = {}) {
  return createLibraryImage(ida, {
    status: "published",
    visibility: "public",
    priceTier: "paid",
    title: `Licence ${crypto.randomUUID()}`,
    publishedAt: new Date(),
    ...state,
  });
}

async function licenceRows(clientId: string, imageId: string) {
  return db.select().from(licences).where(and(eq(licences.clientId, clientId), eq(licences.imageId, imageId)));
}

async function titleOf(imageId: string): Promise<string> {
  const [row] = await db.select({ title: images.title }).from(images).where(eq(images.id, imageId));
  return row.title ?? "";
}

function line(imageId: string, title: string, seenPriceMinor = 9000) {
  return { imageId, licenceTypeId: type.id, seenPriceMinor, seenTitle: title };
}

beforeAll(async () => {
  ida = (await loginAs(fixtureUsers.ida)).actor;
  type = (await currentLicenceType(db))!;
});

describe("grantLicence", () => {
  it("stores the client, contact, source, image, its title, licence type, text version, price, currency and time", async () => {
    const contact = await newContact();
    const imageId = await newImage();
    const before = new Date();
    const { licence, created } = await db.transaction((tx) =>
      grantLicence(tx, contact, { imageId, source: "purchase", licenceTypeId: type.id, priceMinor: 9000, currency: "USD" }),
    );
    const text = await currentLicenceText(db, type.id);
    expect(created).toBe(true);
    expect(licence).toMatchObject({
      tenantId: DEFAULT_TENANT_ID,
      clientId: contact.clientId,
      contactId: contact.userId,
      imageId,
      imageTitle: await titleOf(imageId),
      licenceTypeId: type.id,
      licenceTextId: text!.id,
      source: "purchase",
      priceMinor: 9000,
      currency: "USD",
      revokedAt: null,
    });
    expect(licence.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
  });

  it("keeps the raw title: null for an untitled image", async () => {
    const contact = await newContact();
    const imageId = await newImage({ title: null });
    const { licence } = await grantLicence(db, contact, { imageId, source: "purchase", licenceTypeId: type.id, priceMinor: 9000, currency: "USD" });
    expect(licence.imageTitle).toBeNull();
  });

  it("returns the existing licence with created = false when the client already holds one, also in parallel (S5)", async () => {
    const contact = await newContact();
    const imageId = await newImage();
    const grant = () =>
      db.transaction((tx) => grantLicence(tx, contact, { imageId, source: "purchase", licenceTypeId: type.id, priceMinor: 9000, currency: "USD" }));
    const results = await Promise.all([grant(), grant(), grant()]);
    expect(results.filter((result) => result.created)).toHaveLength(1);
    expect(new Set(results.map((result) => result.licence.id)).size).toBe(1);
    expect(await licenceRows(contact.clientId, imageId)).toHaveLength(1);
  });

  it("allows a new licence once the active one is revoked", async () => {
    const contact = await newContact();
    const imageId = await newImage();
    const input = { imageId, source: "purchase" as const, licenceTypeId: type.id, priceMinor: 9000, currency: "USD" };
    const first = await grantLicence(db, contact, input);
    await db.update(licences).set({ revokedAt: new Date() }).where(eq(licences.id, first.licence.id));
    const second = await grantLicence(db, contact, input);
    expect(second.created).toBe(true);
    expect(second.licence.id).not.toBe(first.licence.id);
  });

  it("is refused to staff", async () => {
    const imageId = await newImage();
    await expect(grantLicence(db, ida, { imageId, source: "purchase", licenceTypeId: type.id, priceMinor: 9000, currency: "USD" })).rejects.toThrow(Forbidden);
  });
});

describe("checkOut", () => {
  it("records one purchase at the current price for a buyable image", async () => {
    const contact = await newContact();
    const imageId = await newImage();
    const title = await titleOf(imageId);
    const result = await checkOut(contact, line(imageId, title));
    expect(result).toEqual({ ok: true, licenceId: expect.any(String) });
    const rows = await licenceRows(contact.clientId, imageId);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: (result as { licenceId: string }).licenceId, source: "purchase", contactId: contact.userId, priceMinor: 9000, currency: "USD", imageTitle: title });
  });

  it("records nothing when the price changed, and records the licence at the new price once confirmed", async () => {
    const contact = await newContact();
    const imageId = await newImage();
    const title = await titleOf(imageId);
    expect(await checkOut(contact, line(imageId, title, 8000))).toEqual({
      priceChanged: true,
      title,
      licenceTypeId: type.id,
      oldMinor: 8000,
      newMinor: 9000,
      currency: "USD",
    });
    expect(await checkOut(contact, { ...line(imageId, title), licenceTypeId: crypto.randomUUID() })).toMatchObject({ priceChanged: true });
    expect(await licenceRows(contact.clientId, imageId)).toHaveLength(0);

    expect(await checkOut(contact, line(imageId, title, 9000))).toMatchObject({ ok: true });
    expect((await licenceRows(contact.clientId, imageId)).map((row) => row.priceMinor)).toEqual([9000]);
  });

  it.each([
    ["hidden (internal)", { visibility: "internal" as const }],
    ["hidden (restricted, not on the list)", { visibility: "restricted" as const }],
    ["now free", { priceTier: "free" as const }],
  ])("removes a line that is %s, with the title the form sent, and records nothing", async (_, state) => {
    const contact = await newContact();
    const imageId = await newImage(state);
    expect(await checkOut(contact, line(imageId, "The title I saw"))).toEqual({ removed: true, title: "The title I saw" });
    expect(await licenceRows(contact.clientId, imageId)).toHaveLength(0);
  });

  it("removes a line the client already holds, and records nothing more", async () => {
    const contact = await newContact();
    const imageId = await newImage();
    const title = await titleOf(imageId);
    expect(await checkOut(contact, line(imageId, title))).toMatchObject({ ok: true });
    expect(await checkOut(contact, line(imageId, title))).toEqual({ removed: true, title });
    expect(await licenceRows(contact.clientId, imageId)).toHaveLength(1);
  });

  it("refuses a direct request for a free or own image at the write function (S7)", async () => {
    const contact = await newContact();
    const free = await newImage({ priceTier: "free" });
    const own = await newImage({ visibility: "restricted", priceTier: "free" });
    await db.insert(imageClients).values({ imageId: own, clientId: contact.clientId });
    for (const imageId of [free, own]) {
      expect(await checkOut(contact, line(imageId, "Sent directly"))).toEqual({ removed: true, title: "Sent directly" });
      expect(await licenceRows(contact.clientId, imageId)).toHaveLength(0);
    }
  });

  it("records exactly one active licence when two checkouts of one image run in parallel for one client (S5)", async () => {
    const contact = await newContact();
    const colleague = await newContact(contact.clientId);
    const imageId = await newImage();
    const title = await titleOf(imageId);
    const results = await Promise.all([checkOut(contact, line(imageId, title)), checkOut(colleague, line(imageId, title))]);
    expect(results.filter((result) => "ok" in result)).toHaveLength(1);
    expect(results.filter((result) => "removed" in result)).toEqual([{ removed: true, title }]);
    expect(await licenceRows(contact.clientId, imageId)).toHaveLength(1);
  });

  it("is refused to staff", async () => {
    await expect(checkOut(ida, line(crypto.randomUUID(), "x"))).rejects.toThrow(Forbidden);
  });
});

describe("listLicences", () => {
  it("lists every licence newest first, with client, contact, title (or the fallback), licence type and price", async () => {
    const contact = await newContact();
    const first = await newImage();
    const second = await newImage({ title: null });
    await checkOut(contact, line(first, await titleOf(first)));
    await checkOut(contact, line(second, "Untitled image"));

    const ours = await db.select({ id: licences.id, imageId: licences.imageId }).from(licences).where(eq(licences.clientId, contact.clientId));
    const idOf = (imageId: string) => ours.find((row) => row.imageId === imageId)!.id;
    const rows = (await listLicences(ida)).filter((row) => ours.some((own) => own.id === row.id));
    expect(rows.map((row) => row.id)).toEqual([idOf(second), idOf(first)]);
    expect(rows[0]).toMatchObject({ clientName: "Licence Client AS", contactName: "Factory Contact" });
    expect(rows.find((row) => row.id === idOf(second))).toMatchObject({
      imageTitle: "Untitled image",
      licenceTypeName: "Standard commercial use",
      priceMinor: 9000,
      currency: "USD",
    });
    expect(rows.find((row) => row.id === idOf(first))?.imageTitle).toBe(await titleOf(first));
  });

  it("is refused to contacts", async () => {
    await expect(listLicences(await newContact())).rejects.toThrow(Forbidden);
  });

  it("keeps the facts from grant time: a later title change does not change the licence (AD-18)", async () => {
    const contact = await newContact();
    const imageId = await newImage();
    const title = await titleOf(imageId);
    const { licenceId } = (await checkOut(contact, line(imageId, title))) as { licenceId: string };
    // The image is this test's own, so renaming it touches nothing another test reads.
    await db.update(images).set({ title: "Renamed after the grant" }).where(eq(images.id, imageId));

    expect((await listLicences(ida)).find((row) => row.id === licenceId)?.imageTitle).toBe(title);
    expect((await getClientLicence(contact, licenceId))?.imageTitle).toBe(title);
  });
});

describe("getClientLicence", () => {
  it("returns a licence of the contact's own client only", async () => {
    const contact = await newContact();
    const colleague = await newContact(contact.clientId);
    const stranger = await newContact();
    const imageId = await newImage();
    const title = await titleOf(imageId);
    const result = (await checkOut(contact, line(imageId, title))) as { licenceId: string };

    const expected = { id: result.licenceId, imageId, imageTitle: title, licenceTypeName: "Standard commercial use", priceMinor: 9000, currency: "USD" };
    expect(await getClientLicence(contact, result.licenceId)).toMatchObject(expected);
    expect(await getClientLicence(colleague, result.licenceId)).toMatchObject(expected);
    expect(await getClientLicence(stranger, result.licenceId)).toBeNull();
    expect(await getClientLicence(contact, crypto.randomUUID())).toBeNull();
    expect(await getClientLicence(contact, "not-a-uuid")).toBeNull();
    await expect(getClientLicence(ida, result.licenceId)).rejects.toThrow(Forbidden);
  });
});
