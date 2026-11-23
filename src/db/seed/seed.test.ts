import { eq, inArray, sql } from "drizzle-orm";
import { expect, it } from "vitest";
import { getDb } from "@/db/client";
import { clients, credentials, users } from "@/db/schema";
import { fixtureClients, fixtureUsers } from "./fixture";
import { seedIfEmpty } from "./seed";

const db = getDb();
const emails = Object.values(fixtureUsers).map((u) => u.email);

// The Vitest global setup has already seeded the empty test database.
it("created the fixture clients and users with argon2id hashes", async () => {
  const seededClients = await db
    .select({ name: clients.name, status: clients.status })
    .from(clients)
    .where(inArray(clients.name, Object.values(fixtureClients).map((c) => c.name)));
  expect(seededClients).toHaveLength(3);
  expect(seededClients).toContainEqual({ name: "Gammel Kunde AS", status: "inactive" });

  const seededUsers = await db
    .select({ email: users.email, role: users.role, client: clients.name, hash: credentials.passwordHash })
    .from(users)
    .leftJoin(clients, eq(clients.id, users.clientId))
    .innerJoin(credentials, eq(credentials.userId, users.id))
    .where(inArray(users.email, emails));
  expect(seededUsers).toHaveLength(6);
  expect(seededUsers.filter((u) => u.role === "staff")).toHaveLength(2);
  expect(seededUsers.filter((u) => u.client === "Fjordkaffe AS")).toHaveLength(2);
  expect(seededUsers.filter((u) => u.client === "Nordlys Sykkel AS")).toHaveLength(1);
  expect(seededUsers.filter((u) => u.client === "Gammel Kunde AS")).toHaveLength(1);
  for (const user of seededUsers) expect(user.hash).toMatch(/^\$argon2id\$/);
});

it("does nothing on a database that already has users", async () => {
  const count = async () =>
    (await db.select({ n: sql<number>`count(*)::int` }).from(users).where(inArray(users.email, emails)))[0].n;
  expect(await seedIfEmpty(db)).toBe(false);
  expect(await count()).toBe(6);
});
