import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

// Owned by the accounts module (AD-3).
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  },
  (t) => [check("clients_status_check", sql`${t.status} in ('active', 'inactive')`)],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    role: text("role", { enum: ["staff", "contact"] }).notNull(),
    // Set for contacts only; staff belong to the agency, not to a client.
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    // Stored trimmed and lower-cased by accounts.createUser.
    email: text("email").notNull(),
    status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_lower_unique").on(sql`lower(${t.email})`),
    index("users_client_id_idx").on(t.clientId),
    check("users_role_check", sql`${t.role} in ('staff', 'contact')`),
    check("users_status_check", sql`${t.status} in ('active', 'inactive')`),
    check(
      "users_role_client_check",
      sql`(${t.role} = 'staff' and ${t.clientId} is null) or (${t.role} = 'contact' and ${t.clientId} is not null)`,
    ),
  ],
);
