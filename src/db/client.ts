import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.ts";

let pool: pg.Pool | undefined;

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Start the app with docker compose, or copy .env.example to .env.`);
  }
  return value;
}

// One pool per process, created on first use so that `next build` never needs a database.
export function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({ connectionString: requireEnv("DATABASE_URL"), connectionTimeoutMillis: 5000 });
    // An idle client losing its connection must not crash the process; the next query reconnects.
    pool.on("error", (error) => console.error(`Idle database connection lost: ${error.message}`));
  }
  return pool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}

export type Db = ReturnType<typeof getDb>;
// A Drizzle transaction, or the db itself. Module write functions take one as their first argument (AD-20).
export type Tx = Db | Parameters<Parameters<Db["transaction"]>[0]>[0];
