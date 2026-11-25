import { sql } from "drizzle-orm";
import { char, check, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { clients, tenants, users } from "./accounts.ts";
import { images } from "./images.ts";

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

const LICENCE_SOURCES = ["purchase", "free_download", "staff_grant"] as const;

// The transaction log (AD-18): one row per licence, written only by licences.grantLicence. The facts are
// copied at grant time, so a later price, text or title change never changes a licence. Revoking sets
// revoked_at and never deletes; the partial unique index allows one active licence per client and image (S5).
export const licences = pgTable(
  "licences",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    // The contact who bought it; null for a staff grant.
    contactId: uuid("contact_id").references(() => users.id, { onDelete: "restrict" }),
    imageId: uuid("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "restrict" }),
    // The image's title as stored when the licence was granted (null when it had none).
    imageTitle: text("image_title"),
    licenceTypeId: uuid("licence_type_id")
      .notNull()
      .references(() => licenceTypes.id, { onDelete: "restrict" }),
    licenceTextId: uuid("licence_text_id")
      .notNull()
      .references(() => licenceTexts.id, { onDelete: "restrict" }),
    source: text("source", { enum: LICENCE_SOURCES }).notNull(),
    // Integer minor units, excluding VAT (Conventions: Money).
    priceMinor: integer("price_minor").notNull(),
    currency: char("currency", { length: 3 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("licences_client_id_image_id_active_unique").on(t.clientId, t.imageId).where(sql`${t.revokedAt} is null`),
    index("licences_image_id_idx").on(t.imageId),
    // The staff Licences tab's order.
    index("licences_created_at_idx").on(t.createdAt.desc(), t.id.desc()),
    check("licences_source_check", sql`${t.source} in ('purchase', 'free_download', 'staff_grant')`),
    check("licences_price_minor_check", sql`${t.priceMinor} >= 0`),
  ],
);
