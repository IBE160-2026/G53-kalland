import { and, asc, eq } from "drizzle-orm";
import { getDb, type Tx } from "@/db/client";
import { clients, users } from "@/db/schema";
import { assertStaff, issueSetupLink, type Actor, type SetupLink } from "@/modules/auth";
import { Conflict, NotFound, Validation } from "@/modules/shared/errors";
import { isUniqueViolation } from "@/modules/shared/db-errors";
import { normaliseEmail } from "@/modules/shared/email";
import type { Status } from "./clients";
import { createUser } from "./users";

// What staff enter in the contact form (FR-2). An empty phone means none.
export type ContactInput = { name: string; email: string; phone: string };

export type ContactField = keyof ContactInput;

// The message key of each field's inline error. The contact form's action maps these keys back to fields.
export const CONTACT_FIELD_ERRORS: Record<ContactField, string> = {
  name: "contacts.errors.name",
  email: "contacts.errors.email",
  phone: "contacts.errors.phone",
};

// The email field's error when another user, staff or contact, already has the email in any letter case.
export const CONTACT_EMAIL_TAKEN = "contacts.errors.emailTaken";

export type Contact = {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string | null;
  status: Status;
};

export const CONTACT_NAME_MAX = 200;
export const EMAIL_MAX = 320;

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_SHAPE = /^[0-9 +()-]{5,30}$/;

// A phone number, already trimmed, is 5–30 characters of digits, spaces, +, -, ( and ).
export function isValidPhone(phone: string): boolean {
  return PHONE_SHAPE.test(phone);
}

const contactColumns = {
  id: users.id,
  clientId: users.clientId,
  name: users.name,
  email: users.email,
  phone: users.phone,
  status: users.status,
};

// Only contacts: a staff user's id matches no row here, so this UI can never change a staff user.
function isContact(contactId: string) {
  return and(eq(users.id, contactId), eq(users.role, "contact"));
}

// Checks and normalises the form's values. Throws Validation with the first wrong field's key.
function checkContactInput(input: ContactInput): { name: string; email: string; phone: string | null } {
  const name = input.name.trim();
  if (name.length === 0 || name.length > CONTACT_NAME_MAX) throw new Validation(CONTACT_FIELD_ERRORS.name);
  const email = normaliseEmail(input.email);
  if (email.length > EMAIL_MAX || !EMAIL_SHAPE.test(email)) throw new Validation(CONTACT_FIELD_ERRORS.email);
  const phone = input.phone.trim();
  if (phone !== "" && !isValidPhone(phone)) throw new Validation(CONTACT_FIELD_ERRORS.phone);
  return { name, email, phone: phone === "" ? null : phone };
}

function toContact(row: Omit<Contact, "clientId"> & { clientId: string | null }): Contact {
  if (row.clientId === null) throw new NotFound();
  return { ...row, clientId: row.clientId };
}

// Staff only (FR-2, FR-4). Creates an active contact of the client and its first setup link in one
// transaction; contacts can be added to an inactive client too. The unique email is the natural key
// (Conventions: Idempotency): a double submit creates one user, and the second is refused as a
// duplicate email, with no user and no link.
export async function createContact(
  tx: Tx,
  actor: Actor,
  clientId: string,
  input: ContactInput,
): Promise<{ contactId: string; link: SetupLink }> {
  assertStaff(actor);
  const values = checkContactInput(input);
  if (!UUID_SHAPE.test(clientId)) throw new NotFound();
  try {
    // A transaction of its own, or a savepoint inside the caller's, so a duplicate leaves the caller's usable.
    return await tx.transaction(async (inner) => {
      const [client] = await inner.select({ id: clients.id }).from(clients).where(eq(clients.id, clientId));
      if (!client) throw new NotFound();
      const contactId = await createUser(inner, { role: "contact", clientId: client.id, ...values, phone: values.phone ?? undefined });
      return { contactId, link: await issueSetupLink(inner, contactId) };
    });
  } catch (error) {
    if (error instanceof Conflict) throw new Validation(CONTACT_EMAIL_TAKEN);
    throw error;
  }
}

// Staff only (FR-4). A new setup link for a contact, for a first password or a reset; it cancels the
// contact's earlier unused links. NotFound for a staff user's id, so this UI never makes staff links.
export async function newContactSetupLink(tx: Tx, actor: Actor, contactId: string): Promise<SetupLink> {
  assertStaff(actor);
  if (!UUID_SHAPE.test(contactId)) throw new NotFound();
  return tx.transaction(async (inner) => {
    const [contact] = await inner.select({ id: users.id }).from(users).where(isContact(contactId));
    if (!contact) throw new NotFound();
    return issueSetupLink(inner, contact.id);
  });
}

// Staff only (FR-2). Replaces the name, email and phone. The user id, role, client and status stay, so
// licences and history stay with the contact, who logs in with the new email afterwards.
export async function updateContact(tx: Tx, actor: Actor, contactId: string, input: ContactInput): Promise<void> {
  assertStaff(actor);
  const values = checkContactInput(input);
  if (!UUID_SHAPE.test(contactId)) throw new NotFound();
  let updated: { id: string }[];
  try {
    updated = await tx.update(users).set(values).where(isContact(contactId)).returning({ id: users.id });
  } catch (error) {
    if (isUniqueViolation(error)) throw new Validation(CONTACT_EMAIL_TAKEN);
    throw error;
  }
  if (updated.length === 0) throw new NotFound();
}

// Staff only (FR-5). A deactivated contact is refused on their next request (S1); nothing is deleted,
// and their licences stay the client's (FR-24).
export async function setContactStatus(tx: Tx, actor: Actor, contactId: string, status: Status): Promise<void> {
  assertStaff(actor);
  if (!UUID_SHAPE.test(contactId)) throw new NotFound();
  const updated = await tx.update(users).set({ status }).where(isContact(contactId)).returning({ id: users.id });
  if (updated.length === 0) throw new NotFound();
}

// Staff only. A client's contacts by name, inactive ones included.
export async function listContactsForStaff(actor: Actor, clientId: string): Promise<Contact[]> {
  assertStaff(actor);
  if (!UUID_SHAPE.test(clientId)) return [];
  const rows = await getDb()
    .select(contactColumns)
    .from(users)
    .where(and(eq(users.clientId, clientId), eq(users.role, "contact")))
    .orderBy(asc(users.name), asc(users.id));
  return rows.map(toContact);
}

// Staff only. One contact; NotFound for a staff user or an unknown id.
export async function getContactForStaff(actor: Actor, contactId: string): Promise<Contact> {
  assertStaff(actor);
  if (!UUID_SHAPE.test(contactId)) throw new NotFound();
  const [row] = await getDb().select(contactColumns).from(users).where(isContact(contactId));
  if (!row) throw new NotFound();
  return toContact(row);
}
