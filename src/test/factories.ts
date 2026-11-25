import { getDb } from "@/db/client";
import { createClient, createUser } from "@/modules/accounts";
import { setPassword } from "@/modules/auth";

// Fresh rows for tests that change state, so the seeded fixture rows stay untouched (AD-7).
export const FACTORY_PASSWORD = "factory-password-1";

// A valid org number (mod-11), shared by factory clients; org numbers need not be unique.
export const FACTORY_ORG_NUMBER = "921456786";

function uniqueEmail(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}@factory.example`;
}

export async function createTestClient(name = "Factory Client AS"): Promise<string> {
  return createClient(getDb(), { name, orgNumber: FACTORY_ORG_NUMBER, billingEmail: uniqueEmail("billing") });
}

export async function createTestContact(clientId?: string): Promise<{ userId: string; clientId: string; email: string }> {
  const db = getDb();
  const ownClientId = clientId ?? (await createTestClient());
  const email = uniqueEmail("contact");
  const userId = await createUser(db, { role: "contact", clientId: ownClientId, name: "Factory Contact", email });
  await setPassword(db, userId, FACTORY_PASSWORD);
  return { userId, clientId: ownClientId, email };
}

export async function createTestStaff(name = "Factory Staff"): Promise<string> {
  return createUser(getDb(), { role: "staff", name, email: uniqueEmail("staff") });
}
