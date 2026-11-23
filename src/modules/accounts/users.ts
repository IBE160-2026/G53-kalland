import { eq } from "drizzle-orm";
import { getDb, type Tx } from "@/db/client";
import { users } from "@/db/schema";
import { DEFAULT_TENANT_ID } from "@/db/tenant";
import { assertStaff, type Actor } from "@/modules/auth";
import { Conflict, NotFound } from "@/modules/shared/errors";
import { isUniqueViolation } from "@/modules/shared/db-errors";
import { normaliseEmail } from "@/modules/shared/email";
import type { Status } from "./clients";

export type NewUser =
  | { role: "staff"; name: string; email: string; status?: Status }
  | { role: "contact"; clientId: string; name: string; email: string; status?: Status };

export type User = {
  id: string;
  role: "staff" | "contact";
  clientId: string | null;
  name: string;
  email: string;
  status: Status;
};

// Creates a staff user or a contact. Throws Conflict when the email is taken, in any letter case.
export async function createUser(tx: Tx, input: NewUser): Promise<string> {
  try {
    const [row] = await tx
      .insert(users)
      .values({
        tenantId: DEFAULT_TENANT_ID,
        role: input.role,
        clientId: input.role === "contact" ? input.clientId : null,
        name: input.name.trim(),
        email: normaliseEmail(input.email),
        status: input.status ?? "active",
      })
      .returning({ id: users.id });
    return row.id;
  } catch (error) {
    if (isUniqueViolation(error)) throw new Conflict("accounts.emailTaken");
    throw error;
  }
}

// Staff only. Deactivating a user refuses them on their next request (S1).
export async function setUserStatus(tx: Tx, actor: Actor, userId: string, status: Status): Promise<void> {
  assertStaff(actor);
  const updated = await tx.update(users).set({ status }).where(eq(users.id, userId)).returning({ id: users.id });
  if (updated.length === 0) throw new NotFound();
}

export async function getUser(userId: string): Promise<User> {
  const [row] = await getDb()
    .select({
      id: users.id,
      role: users.role,
      clientId: users.clientId,
      name: users.name,
      email: users.email,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, userId));
  if (!row) throw new NotFound();
  return row;
}
