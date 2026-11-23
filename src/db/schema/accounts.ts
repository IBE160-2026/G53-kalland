import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Owned by the accounts module (AD-3).
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
