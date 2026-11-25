import { asc, desc, eq, sql } from "drizzle-orm";
import type { Tx } from "@/db/client";
import { licenceTexts, licenceTypes } from "@/db/schema";
import { DEFAULT_TENANT_ID } from "@/db/tenant";

export type LicenceType = { id: string; name: string; priceMinor: number; currency: string };

// One immutable version of a licence type's text; a licence records its id (AD-18).
export type LicenceText = { id: string; body: string };

// Serialises concurrent calls of ensureStandardLicenceType, so it creates the type once.
const LICENCE_TYPE_LOCK_ID = 53_000_106;

const STANDARD_LICENCE_TYPE = { name: "Standard commercial use", priceMinor: 9000, currency: "USD" } as const;

const STANDARD_LICENCE_TEXT_V1 =
  "The client may use the image in its own marketing and communication, in print and online, for as long as it wishes. " +
  "The client may not resell, sublicense or share the image file with third parties, and may not use it in a way that " +
  "suggests that people shown in it endorse a product. The agency keeps the copyright.";

// Creates "Standard commercial use" (9000 minor units, USD, ex VAT) with licence text version 1 when the
// tenant has no licence type yet (FR-23). Idempotent and safe to call concurrently. Called by the seed.
export async function ensureStandardLicenceType(tx: Tx): Promise<void> {
  await tx.transaction(async (inner) => {
    await inner.execute(sql`select pg_advisory_xact_lock(${LICENCE_TYPE_LOCK_ID})`);
    const [existing] = await inner
      .select({ id: licenceTypes.id })
      .from(licenceTypes)
      .where(eq(licenceTypes.tenantId, DEFAULT_TENANT_ID))
      .limit(1);
    if (existing) return;
    const [type] = await inner
      .insert(licenceTypes)
      .values({ tenantId: DEFAULT_TENANT_ID, ...STANDARD_LICENCE_TYPE })
      .returning({ id: licenceTypes.id });
    await inner.insert(licenceTexts).values({ licenceTypeId: type.id, version: 1, body: STANDARD_LICENCE_TEXT_V1 });
  });
}

// The licence type a paid image is sold under, with its current price (AD-18). v1 has one; null before
// the seed has created it.
export async function currentLicenceType(db: Tx): Promise<LicenceType | null> {
  const [row] = await db
    .select({ id: licenceTypes.id, name: licenceTypes.name, priceMinor: licenceTypes.priceMinor, currency: licenceTypes.currency })
    .from(licenceTypes)
    .where(eq(licenceTypes.tenantId, DEFAULT_TENANT_ID))
    .orderBy(asc(licenceTypes.createdAt), asc(licenceTypes.id))
    .limit(1);
  return row ?? null;
}

// The current text of a licence type: its latest licence_texts version, id and body (AD-18), or null
// when the type has no text.
export async function currentLicenceText(db: Tx, licenceTypeId: string): Promise<LicenceText | null> {
  const [row] = await db
    .select({ id: licenceTexts.id, body: licenceTexts.body })
    .from(licenceTexts)
    .where(eq(licenceTexts.licenceTypeId, licenceTypeId))
    .orderBy(desc(licenceTexts.version))
    .limit(1);
  return row ?? null;
}
