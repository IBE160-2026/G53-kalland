import { eq, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { licenceTexts, licenceTypes } from "@/db/schema";
import { currentLicenceText, currentLicenceType, ensureStandardLicenceType, formatPrice } from ".";

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
  it("returns the body of the latest text version, and null for a type without text", async () => {
    const type = await currentLicenceType(db);
    const v1 = await currentLicenceText(db, type!.id);
    expect(v1).toMatch(/^The client may use the image/);
    expect(await currentLicenceText(db, crypto.randomUUID())).toBeNull();

    // Version 2 inside a transaction that is rolled back, so other test files never see it.
    const rollback = new Error("rollback");
    await expect(
      db.transaction(async (tx) => {
        await tx.insert(licenceTexts).values({ licenceTypeId: type!.id, version: 2, body: "Version two." });
        expect(await currentLicenceText(tx, type!.id)).toBe("Version two.");
        throw rollback;
      }),
    ).rejects.toBe(rollback);
    expect(await currentLicenceText(db, type!.id)).toBe(v1);
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
  });
});
