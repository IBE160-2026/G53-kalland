import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../db/schema/index.ts";
import { resetTestDatabase } from "../db/reset-test.ts";
import { seedIfEmpty } from "../db/seed/seed.ts";

// Every Vitest run starts from a freshly migrated and seeded test database (AD-7).
export default async function setup() {
  await resetTestDatabase();
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, max: 1 });
  try {
    await seedIfEmpty(drizzle(pool, { schema }));
  } finally {
    await pool.end();
  }
}
