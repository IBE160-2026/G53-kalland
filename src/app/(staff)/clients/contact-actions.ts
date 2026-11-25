"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import {
  CONTACT_EMAIL_TAKEN,
  CONTACT_FIELD_ERRORS,
  CONTACT_NAME_MAX,
  createContact,
  EMAIL_MAX,
  getContactForStaff,
  isValidPhone,
  newContactSetupLink,
  setContactStatus,
  updateContact,
  type ContactField,
  type ContactInput,
} from "@/modules/accounts";
import { requireStaff, type SetupLink } from "@/modules/auth";
import { Validation, toFormState, type FormState } from "@/modules/shared/errors";
import { formatOsloDateTime } from "@/modules/shared/time";

// A setup link as the staff page shows it: the URL to copy and when it expires, in Oslo time.
export type SetupLinkView = { url: string; expires: string };

// What the contact form shows after a save: each field's inline error when it was refused (the form keeps
// its own values), or the new contact's name and setup link when it was added.
export type ContactFormState = FormState & {
  fieldErrors?: Partial<Record<ContactField, string>>;
  created?: { name: string; link: SetupLinkView };
};

export type SetupLinkState = FormState & { link?: SetupLinkView };

function viewOf(link: SetupLink): SetupLinkView {
  return { url: link.url, expires: formatOsloDateTime(link.expiresAt) };
}

const contactInput = z.object({
  name: z.string().trim().min(1).max(CONTACT_NAME_MAX),
  email: z.string().trim().toLowerCase().max(EMAIL_MAX).pipe(z.email()),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || isValidPhone(value)),
});

// Module keys that belong to a field; the duplicate-email key is the email field's too.
const FIELD_OF_KEY = new Map<string, ContactField>([
  ...Object.entries(CONTACT_FIELD_ERRORS).map(([field, key]) => [key, field as ContactField] as const),
  [CONTACT_EMAIL_TAKEN, "email"],
]);

function valuesOf(formData: FormData): ContactInput {
  const text = (name: string) => String(formData.get(name) ?? "");
  return { name: text("name"), email: text("email"), phone: text("phone") };
}

// Parses the form. Every field zod refuses gets its own inline error, and nothing is saved.
function parse(values: ContactInput): { input: ContactInput } | { state: ContactFormState } {
  const parsed = contactInput.safeParse(values);
  if (parsed.success) return { input: parsed.data };
  const fieldErrors: Partial<Record<ContactField, string>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as ContactField;
    if (field in CONTACT_FIELD_ERRORS) fieldErrors[field] = CONTACT_FIELD_ERRORS[field];
  }
  if (Object.keys(fieldErrors).length === 0) return { state: { error: "errors.validation" } };
  return { state: { fieldErrors } };
}

// A module Validation with a field's key becomes that field's inline error; anything else is a form error.
function stateOf(error: unknown): ContactFormState {
  if (error instanceof Validation) {
    const field = FIELD_OF_KEY.get(error.messageKey);
    if (field) return { fieldErrors: { [field]: error.messageKey } };
  }
  return toFormState(error);
}

// The Add contact form (FR-2, FR-4), bound to the client's id. The contact and its first setup link are
// made in one transaction; the form then shows the link instead of redirecting, since the app sends no
// email. The unique email is the natural key, so a double submit creates one contact and the second is
// refused as a duplicate email.
export async function createContactAction(
  clientId: string,
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const actor = await requireStaff();
  const id = z.uuid().safeParse(clientId);
  if (!id.success) return { error: "errors.notFound" };
  const result = parse(valuesOf(formData));
  if ("state" in result) return result.state;

  let link: SetupLink;
  try {
    ({ link } = await getDb().transaction((tx) => createContact(tx, actor, id.data, result.input)));
  } catch (error) {
    return stateOf(error);
  }
  revalidatePath("/clients", "layout");
  return { created: { name: result.input.name, link: viewOf(link) } };
}

// The Edit contact form (FR-2), bound to the client's and the contact's id. A contact of another client
// is not found, so a mismatched pair never edits it.
export async function updateContactAction(
  clientId: string,
  contactId: string,
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const actor = await requireStaff();
  const ids = z.object({ clientId: z.uuid(), contactId: z.uuid() }).safeParse({ clientId, contactId });
  if (!ids.success) return { error: "errors.notFound" };
  const result = parse(valuesOf(formData));
  if ("state" in result) return result.state;

  try {
    const contact = await getContactForStaff(actor, ids.data.contactId);
    if (contact.clientId !== ids.data.clientId) return { error: "errors.notFound" };
    await updateContact(getDb(), actor, ids.data.contactId, result.input);
  } catch (error) {
    return stateOf(error);
  }
  revalidatePath("/clients", "layout");
  redirect(`/clients/${ids.data.clientId}`);
}

const statusInput = z.object({ contactId: z.uuid(), status: z.enum(["active", "inactive"]) });

// Deactivate / Reactivate (FR-5). A deactivated contact is refused on their next request (S1).
export async function setContactStatusAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireStaff();
  const parsed = statusInput.safeParse({ contactId: formData.get("contactId"), status: formData.get("status") });
  if (!parsed.success) return { error: "errors.validation" };
  try {
    await setContactStatus(getDb(), actor, parsed.data.contactId, parsed.data.status);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/clients", "layout");
  return {};
}

// New setup link (FR-4), for a first password or a reset. It cancels the contact's earlier unused links.
export async function newSetupLinkAction(_previous: SetupLinkState, formData: FormData): Promise<SetupLinkState> {
  const actor = await requireStaff();
  const parsed = z.uuid().safeParse(formData.get("contactId"));
  if (!parsed.success) return { error: "errors.validation" };
  try {
    return { link: viewOf(await newContactSetupLink(getDb(), actor, parsed.data)) };
  } catch (error) {
    return toFormState(error);
  }
}
