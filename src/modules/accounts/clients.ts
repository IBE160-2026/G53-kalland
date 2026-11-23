import { eq } from "drizzle-orm";
import type { Tx } from "@/db/client";
import { clients } from "@/db/schema";
import { DEFAULT_TENANT_ID } from "@/db/tenant";
import { assertStaff, type Actor } from "@/modules/auth";
import { NotFound } from "@/modules/shared/errors";

export type Status = "active" | "inactive";

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
