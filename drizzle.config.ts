import { defineConfig } from "drizzle-kit";

// Only `drizzle-kit generate` is used: committed, forward-only SQL migrations. Never `push` (AD-24).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
});
