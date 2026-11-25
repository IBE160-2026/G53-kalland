import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uniqueIndex, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";

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
    // Nine digits, stored without spaces; the mod-11 check runs in accounts (FR-1).
    orgNumber: text("org_number"),
    // Stored trimmed and lower-cased by accounts. Nullable only so clients made before Story 2.1 migrate.
    billingEmail: text("billing_email"),
    // An active staff user, checked by accounts. Nullable for the same reason.
    accountManagerId: uuid("account_manager_id").references((): AnyPgColumn => users.id, { onDelete: "restrict" }),
    // Staff only: never shown on a contact page.
    staffNotes: text("staff_notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // The create form's nonce: a repeated submit finds the client it already made (Conventions: Idempotency).
    formNonce: uuid("form_nonce"),
  },
  (t) => [
    check("clients_status_check", sql`${t.status} in ('active', 'inactive')`),
    check("clients_org_number_check", sql`${t.orgNumber} ~ '^[0-9]{9}$'`),
    uniqueIndex("clients_form_nonce_unique").on(t.formNonce),
  ],
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
    // Optional, stored trimmed by accounts; null when none was given (Story 2.2).
    phone: text("phone"),
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
