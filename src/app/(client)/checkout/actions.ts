"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireContact } from "@/modules/auth";
import { checkOut, formatAmount, formatPrice } from "@/modules/licences";
import { toFormState, type FormState } from "@/modules/shared/errors";

// What the checkout form shows after a submit that recorded nothing (NFR-7).
export type CheckoutState = FormState & {
  removed?: { title: string };
  priceChanged?: { title: string; licenceTypeId: string; newMinor: number; oldPrice: string; newPrice: string; newPriceLabel: string };
};

const checkoutInput = z.object({
  imageId: z.uuid(),
  licenceTypeId: z.uuid(),
  // Digits only, so a missing or malformed field is a validation error rather than 0.
  seenPriceMinor: z
    .string()
    .regex(/^\d{1,15}$/)
    .transform(Number),
  seenTitle: z.string(),
});

// "Check out" and "Confirm new price" (FR-32, first cut). The client and contact come from the session
// (AD-5); the form carries only the line as the contact saw it. On success it goes to the confirmation.
export async function checkOutAction(_previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const actor = await requireContact();
  if (formData.get("terms") !== "accepted") return { error: "checkout.termsRequired" };
  const parsed = checkoutInput.safeParse({
    imageId: formData.get("imageId"),
    licenceTypeId: formData.get("licenceTypeId"),
    seenPriceMinor: formData.get("seenPriceMinor"),
    seenTitle: formData.get("seenTitle"),
  });
  if (!parsed.success) return { error: "errors.validation" };

  let result;
  try {
    result = await checkOut(actor, parsed.data);
  } catch (error) {
    return toFormState(error);
  }
  if ("ok" in result) redirect(`/checkout/confirmation?licence=${result.licenceId}`);
  if ("removed" in result) return { removed: { title: result.title } };
  return {
    priceChanged: {
      title: result.title,
      licenceTypeId: result.licenceTypeId,
      newMinor: result.newMinor,
      oldPrice: formatAmount(result.oldMinor),
      newPrice: formatAmount(result.newMinor),
      newPriceLabel: formatPrice(result.newMinor, result.currency),
    },
  };
}
