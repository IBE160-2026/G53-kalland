import { asc, eq } from "drizzle-orm";
import { getDb, type Tx } from "@/db/client";
import { clients } from "@/db/schema";
import { DEFAULT_TENANT_ID } from "@/db/tenant";
import { assertStaff, type Actor } from "@/modules/auth";
import { NotFound } from "@/modules/shared/errors";

export type Status = "active" | "inactive";

export type Client = { id: string; name: string; status: Status };

export async function createClient(tx: Tx, input: { name: string; status?: Status }): Promise<string> {
  const [row] = await tx
    .insert(clients)
    .values({ tenantId: DEFAULT_TENANT_ID, name: input.name.trim(), status: input.status ?? "active" })
    .returning({ id: clients.id });
  return row.id;
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
