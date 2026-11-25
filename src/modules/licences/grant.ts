import { and, eq, sql } from "drizzle-orm";
import type { Tx } from "@/db/client";
import { images, licences } from "@/db/schema";
import { DEFAULT_TENANT_ID } from "@/db/tenant";
import { assertContact, type Actor } from "@/modules/auth";
import { NotFound } from "@/modules/shared/errors";
import { currentLicenceText } from "./types";

export type LicenceSource = (typeof licences.$inferSelect)["source"];
export type Licence = typeof licences.$inferSelect;

export type GrantInput = {
  imageId: string;
  source: LicenceSource;
  licenceTypeId: string;
  priceMinor: number;
  currency: string;
};

// The only way a licence is created (AD-18). The caller has already decided that the client may have it
// (checkout re-checks through access), and passes its transaction (AD-20). The client and contact come
// from the Actor. It copies the facts as they are now: the image's stored title, the licence type's
// current text version, the price and currency. One active licence per client and image (S5): a second
// grant inserts nothing and returns the existing licence with created = false.
export async function grantLicence(tx: Tx, actor: Actor, input: GrantInput): Promise<{ licence: Licence; created: boolean }> {
  assertContact(actor);
  const [image] = await tx.select({ title: images.title }).from(images).where(eq(images.id, input.imageId));
  if (!image) throw new NotFound();
  const text = await currentLicenceText(tx, input.licenceTypeId);
  if (!text) throw new Error("The licence type has no licence text; the seed creates it.");

  const [inserted] = await tx
    .insert(licences)
    .values({
      tenantId: DEFAULT_TENANT_ID,
      clientId: actor.clientId,
      contactId: actor.userId,
      imageId: input.imageId,
      imageTitle: image.title,
      licenceTypeId: input.licenceTypeId,
      licenceTextId: text.id,
      source: input.source,
      priceMinor: input.priceMinor,
      currency: input.currency,
    })
    .onConflictDoNothing({ target: [licences.clientId, licences.imageId], where: sql`${licences.revokedAt} is null` })
    .returning();
  if (inserted) return { licence: inserted, created: true };

  const [existing] = await tx
    .select()
    .from(licences)
    .where(and(eq(licences.clientId, actor.clientId), eq(licences.imageId, input.imageId), sql`${licences.revokedAt} is null`));
  return { licence: existing, created: false };
}
