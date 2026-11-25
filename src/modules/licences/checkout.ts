import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { getClientImage } from "@/modules/access";
import { assertContact, type Actor } from "@/modules/auth";
import { grantLicence } from "./grant";

// One checkout line as the contact saw it: the licence type and price on the page, and the title, which
// the "removed" message repeats so it never shows the title of an image the client can no longer see.
export type CheckoutInput = { imageId: string; licenceTypeId: string; seenPriceMinor: number; seenTitle: string };

export type CheckoutResult =
  | { ok: true; licenceId: string }
  | { removed: true; title: string }
  | { priceChanged: true; title: string; licenceTypeId: string; oldMinor: number; newMinor: number; currency: string };

// Single-image checkout (FR-23, FR-32 first cut; the one-line case of the Epic 5 cart). One transaction
// (AD-19, AD-20): under an advisory lock on the client, so one client's checkouts run one at a time, it
// re-checks the line through access and grants the licence. Nothing is written unless every check passes.
// - Not visible, now free or already held (canBuy false, which also refuses a direct request for a free
//   or own image, S7), or a grant that found an active licence (S5): "removed".
// - Another licence type or price than the contact saw: "priceChanged", with the new price to confirm.
export async function checkOut(actor: Actor, input: CheckoutInput): Promise<CheckoutResult> {
  assertContact(actor);
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${actor.clientId}::text, 0))`);
    const removed = { removed: true, title: input.seenTitle } as const;
    const image = await getClientImage(actor, input.imageId, tx);
    if (!image || !image.canBuy || image.price === "free") return removed;
    const price = image.price;
    if (price.licenceTypeId !== input.licenceTypeId || price.priceMinor !== input.seenPriceMinor) {
      return {
        priceChanged: true,
        title: image.title,
        licenceTypeId: price.licenceTypeId,
        oldMinor: input.seenPriceMinor,
        newMinor: price.priceMinor,
        currency: price.currency,
      };
    }
    const { licence, created } = await grantLicence(tx, actor, {
      imageId: image.id,
      source: "purchase",
      licenceTypeId: price.licenceTypeId,
      priceMinor: price.priceMinor,
      currency: price.currency,
    });
    return created ? { ok: true, licenceId: licence.id } : removed;
  });
}
