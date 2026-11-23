import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { requireEnv } from "./client.ts";

const migrationsFolder = fileURLToPath(new URL("./migrations", import.meta.url));

// Applies the committed SQL migrations in order. Forward-only (AD-24).
export async function runMigrations(connectionString: string): Promise<void> {
  const pool = new pg.Pool({ connectionString, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder });
  } finally {
    await pool.end();
  }
}

if (import.meta.main) {
  try {
    await runMigrations(requireEnv("DATABASE_URL"));
    console.log("Migrations applied.");
  } catch (error) {
    console.error(`Migrations failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
