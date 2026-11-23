import { sql } from "drizzle-orm";
import { char, check, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./accounts.ts";

// Owned by the licences module (AD-3). A paid image's price is its licence type's current price (AD-18).
export const licenceTypes = pgTable(
  "licence_types",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    // Integer minor units, excluding VAT (Conventions: Money).
    priceMinor: integer("price_minor").notNull(),
    currency: char("currency", { length: 3 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("licence_types_price_minor_check", sql`${t.priceMinor} >= 0`)],
);

// Licence texts are immutable versions; a licence records the version it was granted under (AD-18).
export const licenceTexts = pgTable(
  "licence_texts",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    licenceTypeId: uuid("licence_type_id")
      .notNull()
      .references(() => licenceTypes.id, { onDelete: "restrict" }),
    version: integer("version").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("licence_texts_licence_type_id_version_unique").on(t.licenceTypeId, t.version)],
);
