import pg from "pg";
import { runMigrations } from "./migrate.ts";

type Env = Record<string, string | undefined>;

function databaseKey(url: string): string {
  const { hostname, port, pathname } = new URL(url);
  return `${hostname}:${port || "5432"}${pathname}`;
}

// Returns the test database URL, or throws if resetting it could touch the dev database.
export function assertSafeTestTarget(env: Env): string {
  const testUrl = env.TEST_DATABASE_URL;
  if (!testUrl) {
    throw new Error("TEST_DATABASE_URL is not set, so there is no test database to reset.");
  }
  if (env.DATABASE_URL && databaseKey(env.DATABASE_URL) === databaseKey(testUrl)) {
    throw new Error("TEST_DATABASE_URL points at the same database as DATABASE_URL. Refusing to reset it.");
  }
  if (!new URL(testUrl).pathname.endsWith("_test")) {
    throw new Error("TEST_DATABASE_URL must name a database ending in _test. Refusing to reset it.");
  }
  return testUrl;
}

// Drops everything in the test database and applies the migrations again (AD-7).
export async function resetTestDatabase(env: Env = process.env): Promise<void> {
  const testUrl = assertSafeTestTarget(env);
  const client = new pg.Client({ connectionString: testUrl, connectionTimeoutMillis: 5000 });
  await client.connect();
  try {
    await client.query("drop schema if exists drizzle cascade; drop schema public cascade; create schema public;");
  } finally {
    await client.end();
  }
  await runMigrations(testUrl);
}

if (import.meta.main) {
  try {
    await resetTestDatabase();
    console.log("Test database reset and migrated.");
  } catch (error) {
    console.error(`Test database reset failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
