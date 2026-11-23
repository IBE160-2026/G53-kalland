"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/modules/auth";
import { publishImage, saveAccess } from "@/modules/images";
import { toFormState, type FormState } from "@/modules/shared/errors";

const publishInput = z.object({ imageId: z.uuid() });

const clientIds = z.array(z.uuid()).max(500);

const saveAccessInput = z.object({
  imageId: z.uuid(),
  version: z.number().int().min(1),
  visibility: z.enum(["internal", "restricted", "public"]),
  priceTier: z.enum(["free", "paid"]),
  clients: z.object({ added: clientIds, removed: clientIds }),
});

export type SaveAccessInput = z.input<typeof saveAccessInput>;

// "Publish this image" (FR-19a). Publishing an image that is already published changes nothing.
export async function publishImageAction(input: { imageId: string }): Promise<FormState> {
  const actor = await requireStaff();
  const parsed = publishInput.safeParse(input);
  if (!parsed.success) return { error: "errors.validation" };
  try {
    await publishImage(actor, parsed.data.imageId);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/library");
  return {};
}

// Save changes in the Library Details panel: visibility, price and the restricted list as a diff, with
// the version the panel loaded (AD-8). A stale version gives the NFR-7 failed-save message.
export async function saveAccessAction(input: SaveAccessInput): Promise<FormState> {
  const actor = await requireStaff();
  const parsed = saveAccessInput.safeParse(input);
  if (!parsed.success) return { error: "errors.validation" };
  const { imageId, ...access } = parsed.data;
  try {
    await saveAccess(actor, imageId, access);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/library");
  return {};
}
