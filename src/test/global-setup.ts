import { resetTestDatabase } from "../db/reset-test.ts";

// Every Vitest run starts from a freshly migrated test database (AD-7).
export default async function setup() {
  await resetTestDatabase();
}
