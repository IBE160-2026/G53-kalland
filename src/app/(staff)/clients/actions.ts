"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import {
  CLIENT_FIELD_ERRORS,
  createClientAsStaff,
  setClientStatus,
  updateClient,
  type ClientField,
  type ClientInput,
} from "@/modules/accounts";
import { requireStaff } from "@/modules/auth";
import { Validation, toFormState, type FormState } from "@/modules/shared/errors";
import { isValidOrgNumber, normaliseOrgNumber } from "@/modules/shared/org-number";

// What the client form shows after a refused save: each field's inline error. The form keeps its own values.
export type ClientFormState = FormState & {
  fieldErrors?: Partial<Record<ClientField, string>>;
};

const clientInput = z.object({
  name: z.string().trim().min(1).max(200),
  orgNumber: z
    .string()
    .transform(normaliseOrgNumber)
    .refine((value) => value === "" || isValidOrgNumber(value)),
  billingEmail: z.string().trim().toLowerCase().max(320).pipe(z.email()),
  accountManagerId: z.uuid(),
  staffNotes: z.string().max(5000),
});

const FIELD_OF_KEY = new Map(Object.entries(CLIENT_FIELD_ERRORS).map(([field, key]) => [key, field as ClientField]));

function valuesOf(formData: FormData): ClientInput {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    name: text("name"),
    orgNumber: text("orgNumber"),
    billingEmail: text("billingEmail"),
    accountManagerId: text("accountManagerId"),
    staffNotes: text("staffNotes"),
  };
}

// Parses the form. Every field zod refuses gets its own inline error; a refusal that maps to no field
// (such as staff notes that are too long) is a form error. Nothing is saved then.
function parse(values: ClientInput): { input: ClientInput } | { state: ClientFormState } {
  const parsed = clientInput.safeParse(values);
  if (parsed.success) return { input: parsed.data };
  const fieldErrors: Partial<Record<ClientField, string>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as ClientField;
    if (field in CLIENT_FIELD_ERRORS) fieldErrors[field] = CLIENT_FIELD_ERRORS[field];
  }
  if (Object.keys(fieldErrors).length === 0) return { state: { error: "errors.validation" } };
  return { state: { fieldErrors } };
}

// A module Validation with a field's key becomes that field's inline error; anything else is a form error.
function stateOf(error: unknown): ClientFormState {
  if (error instanceof Validation) {
    const field = FIELD_OF_KEY.get(error.messageKey);
    if (field) return { fieldErrors: { [field]: error.messageKey } };
  }
  return toFormState(error);
}

// The Add client form (FR-1). The nonce rendered into the form makes a double submit create one client.
export async function createClientAction(_previous: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const actor = await requireStaff();
  const nonce = z.uuid().safeParse(formData.get("nonce"));
  if (!nonce.success) return { error: "errors.validation" };
  const result = parse(valuesOf(formData));
  if ("state" in result) return result.state;

  let clientId: string;
  try {
    clientId = await createClientAsStaff(getDb(), actor, result.input, nonce.data);
  } catch (error) {
    return stateOf(error);
  }
  revalidatePath("/clients", "layout");
  redirect(`/clients/${clientId}`);
}

// The Edit client form (FR-1), bound to the client's id.
export async function updateClientAction(
  clientId: string,
  _previous: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const actor = await requireStaff();
  const id = z.uuid().safeParse(clientId);
  if (!id.success) return { error: "errors.notFound" };
  const result = parse(valuesOf(formData));
  if ("state" in result) return result.state;

  try {
    await updateClient(getDb(), actor, id.data, result.input);
  } catch (error) {
    return stateOf(error);
  }
  revalidatePath("/clients", "layout");
  redirect(`/clients/${id.data}`);
}

const statusInput = z.object({ clientId: z.uuid(), status: z.enum(["active", "inactive"]) });

// Set inactive / Set active (FR-5). An inactive client's contacts are refused on their next request (S2).
export async function setClientStatusAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireStaff();
  const parsed = statusInput.safeParse({ clientId: formData.get("clientId"), status: formData.get("status") });
  if (!parsed.success) return { error: "errors.validation" };
  try {
    await setClientStatus(getDb(), actor, parsed.data.clientId, parsed.data.status);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/clients", "layout");
  return {};
}
