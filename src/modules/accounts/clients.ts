import { and, asc, count, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb, type Tx } from "@/db/client";
import { clients, users } from "@/db/schema";
import { DEFAULT_TENANT_ID } from "@/db/tenant";
import { assertStaff, type Actor } from "@/modules/auth";
import { NotFound, Validation } from "@/modules/shared/errors";
import { normaliseEmail } from "@/modules/shared/email";
import { isValidOrgNumber, normaliseOrgNumber } from "@/modules/shared/org-number";

export type Status = "active" | "inactive";

export type Client = { id: string; name: string; status: Status };

// What staff enter in the client form (FR-1). An empty org number means none.
export type ClientInput = {
  name: string;
  orgNumber: string;
  billingEmail: string;
  accountManagerId: string;
  staffNotes: string;
};

export type ClientField = "name" | "orgNumber" | "billingEmail" | "accountManagerId";

// The message key of each field's inline error. The client form's action maps these keys back to fields.
export const CLIENT_FIELD_ERRORS: Record<ClientField, string> = {
  name: "clients.errors.name",
  orgNumber: "clients.errors.orgNumber",
  billingEmail: "clients.errors.billingEmail",
  accountManagerId: "clients.errors.accountManager",
};

// The client list in the Clients sidebar (UX-DR-8).
export type ClientListItem = { id: string; name: string; status: Status; contactCount: number };

// Everything the staff client details view shows, staff notes and account manager included.
export type ClientDetails = {
  id: string;
  name: string;
  status: Status;
  orgNumber: string | null;
  billingEmail: string | null;
  accountManagerId: string | null;
  accountManagerName: string | null;
  staffNotes: string;
  createdAt: Date;
};

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// For the seed and the test factories, which have no Actor. Staff create clients with createClientAsStaff.
export async function createClient(
  tx: Tx,
  input: {
    name: string;
    status?: Status;
    orgNumber?: string;
    billingEmail?: string;
    accountManagerId?: string;
    staffNotes?: string;
  },
): Promise<string> {
  const [row] = await tx
    .insert(clients)
    .values({
      tenantId: DEFAULT_TENANT_ID,
      name: input.name.trim(),
      status: input.status ?? "active",
      orgNumber: input.orgNumber === undefined ? null : normaliseOrgNumber(input.orgNumber),
      billingEmail: input.billingEmail === undefined ? null : normaliseEmail(input.billingEmail),
      accountManagerId: input.accountManagerId ?? null,
      staffNotes: input.staffNotes ?? "",
    })
    .returning({ id: clients.id });
  return row.id;
}

// Checks and normalises the form's values. Throws Validation with the first wrong field's key.
async function checkClientInput(tx: Tx, input: ClientInput) {
  const name = input.name.trim();
  if (name.length === 0) throw new Validation(CLIENT_FIELD_ERRORS.name);
  const orgNumber = normaliseOrgNumber(input.orgNumber);
  if (orgNumber !== "" && !isValidOrgNumber(orgNumber)) throw new Validation(CLIENT_FIELD_ERRORS.orgNumber);
  const billingEmail = normaliseEmail(input.billingEmail);
  if (!EMAIL_SHAPE.test(billingEmail)) throw new Validation(CLIENT_FIELD_ERRORS.billingEmail);
  if (!UUID_SHAPE.test(input.accountManagerId)) throw new Validation(CLIENT_FIELD_ERRORS.accountManagerId);
  const [manager] = await tx
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, input.accountManagerId), eq(users.role, "staff"), eq(users.status, "active")));
  if (!manager) throw new Validation(CLIENT_FIELD_ERRORS.accountManagerId);
  return {
    name,
    orgNumber: orgNumber === "" ? null : orgNumber,
    billingEmail,
    accountManagerId: manager.id,
    staffNotes: input.staffNotes.trim(),
  };
}

// Staff only (FR-1). Creates an active client. The form's nonce makes a repeated submit return the
// client it already created, so a double submit creates one client (Conventions: Idempotency).
export async function createClientAsStaff(tx: Tx, actor: Actor, input: ClientInput, nonce: string): Promise<string> {
  assertStaff(actor);
  const values = await checkClientInput(tx, input);
  const [created] = await tx
    .insert(clients)
    .values({ tenantId: DEFAULT_TENANT_ID, status: "active", formNonce: nonce, ...values })
    .onConflictDoNothing({ target: clients.formNonce })
    .returning({ id: clients.id });
  if (created) return created.id;
  const [existing] = await tx.select({ id: clients.id }).from(clients).where(eq(clients.formNonce, nonce));
  return existing.id;
}

// Staff only (FR-1). Replaces the client's details; the status changes only through setClientStatus.
export async function updateClient(tx: Tx, actor: Actor, clientId: string, input: ClientInput): Promise<void> {
  assertStaff(actor);
  const values = await checkClientInput(tx, input);
  const updated = await tx.update(clients).set(values).where(eq(clients.id, clientId)).returning({ id: clients.id });
  if (updated.length === 0) throw new NotFound();
}

// Staff only. Deactivating a client refuses its contacts on their next request (S2).
export async function setClientStatus(tx: Tx, actor: Actor, clientId: string, status: Status): Promise<void> {
  assertStaff(actor);
  const updated = await tx.update(clients).set({ status }).where(eq(clients.id, clientId)).returning({ id: clients.id });
  if (updated.length === 0) throw new NotFound();
}

// A read for display, such as the client shell's name. Callers pass an id they are allowed to show.
export async function getClient(clientId: string): Promise<Client> {
  const [row] = await getDb()
    .select({ id: clients.id, name: clients.name, status: clients.status })
    .from(clients)
    .where(eq(clients.id, clientId));
  if (!row) throw new NotFound();
  return row;
}

// The clients staff can add to a restricted list, by name (FR-21). Inactive clients are left out.
export async function listActiveClients(): Promise<{ id: string; name: string }[]> {
  return getDb()
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(eq(clients.status, "active"))
    .orderBy(asc(clients.name), asc(clients.id));
}

// Staff only. Every client, inactive ones included, newest first, with its number of contacts.
export async function listClientsForStaff(actor: Actor): Promise<ClientListItem[]> {
  assertStaff(actor);
  return getDb()
    .select({ id: clients.id, name: clients.name, status: clients.status, contactCount: count(users.id) })
    .from(clients)
    .leftJoin(users, and(eq(users.clientId, clients.id), eq(users.role, "contact")))
    .groupBy(clients.id)
    .orderBy(desc(clients.createdAt), desc(clients.id));
}

// Staff only: the result holds staff notes and the account manager, which no contact may see.
export async function getClientDetails(actor: Actor, clientId: string): Promise<ClientDetails> {
  assertStaff(actor);
  const manager = alias(users, "account_manager");
  const [row] = await getDb()
    .select({
      id: clients.id,
      name: clients.name,
      status: clients.status,
      orgNumber: clients.orgNumber,
      billingEmail: clients.billingEmail,
      accountManagerId: clients.accountManagerId,
      accountManagerName: manager.name,
      staffNotes: clients.staffNotes,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .leftJoin(manager, eq(manager.id, clients.accountManagerId))
    .where(eq(clients.id, clientId));
  if (!row) throw new NotFound();
  return row;
}
