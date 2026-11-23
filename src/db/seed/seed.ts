import { sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import { users } from "@/db/schema";
import { createClient, createUser } from "@/modules/accounts";
import { setPassword } from "@/modules/auth";
import { log } from "@/modules/shared/log";
import { DEMO_PASSWORD, fixtureClients, fixtureUsers, type FixtureClientKey } from "./fixture";

// Any constant shared by every process that seeds; serialises concurrent starts.
const SEED_LOCK_ID = 53_000_102;

// Creates the fixture clients and users, through the accounts and auth modules (AD-3), when the users
// table is empty. Runs in one transaction under an advisory lock. Returns true if it seeded.
export async function seedIfEmpty(db: Db): Promise<boolean> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${SEED_LOCK_ID})`);
    const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(users);
    if (count > 0) return false;

    const clientIds = {} as Record<FixtureClientKey, string>;
    for (const [key, client] of Object.entries(fixtureClients) as [FixtureClientKey, (typeof fixtureClients)[FixtureClientKey]][]) {
      clientIds[key] = await createClient(tx, client);
    }
    for (const user of Object.values(fixtureUsers)) {
      const userId =
        user.role === "staff"
          ? await createUser(tx, user)
          : await createUser(tx, { ...user, clientId: clientIds[user.client] });
      await setPassword(tx, userId, DEMO_PASSWORD);
    }
    return true;
  });
}

// Called from src/instrumentation.ts when SEED_ON_START=true.
export async function seedOnStart(db: Db): Promise<void> {
  const seeded = await seedIfEmpty(db);
  log.info(seeded ? "Seeded the demo users." : "Users exist; seed skipped.");
}
