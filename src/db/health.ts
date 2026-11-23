import type pg from "pg";
import { getPool } from "./client.ts";

const TIMEOUT_MS = 3000;

// True when the database answers a trivial query within 3 s. Never throws, also when DATABASE_URL is unset.
export async function checkDatabase(pool?: pg.Pool): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Database health check timed out.")), TIMEOUT_MS);
  });
  try {
    await Promise.race([(pool ?? getPool()).query("select 1"), timeout]);
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
