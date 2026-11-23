import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants, users } from "./accounts.ts";

// Owned by the images module (AD-3).
const VISIBILITIES = ["internal", "restricted", "public"] as const;
const PRICE_TIERS = ["free", "paid"] as const;
const FIELD_SOURCES = ["embedded", "ai", "staff"] as const;

// A batch holds defaults only; they are copied onto each image when its row is created (AD-9).
export const batches = pgTable(
  "batches",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    visibility: text("visibility", { enum: VISIBILITIES }).notNull().default("internal"),
    priceTier: text("price_tier", { enum: PRICE_TIERS }).notNull().default("free"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("batches_owner_id_idx").on(t.ownerId),
    check("batches_visibility_check", sql`${t.visibility} in ('internal', 'restricted', 'public')`),
    check("batches_price_tier_check", sql`${t.priceTier} in ('free', 'paid')`),
  ],
);

// status and processingState are separate columns (AD-8). "Rejected" is never stored.
export const images = pgTable(
  "images",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "restrict" }),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    // The name the file had on the uploader's machine. Display only; never a storage key (AD-15).
    filename: text("filename").notNull(),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    processingState: text("processing_state", { enum: ["uploading", "queued", "generating", "ready", "failed"] })
      .notNull()
      .default("uploading"),
    visibility: text("visibility", { enum: VISIBILITIES }).notNull(),
    priceTier: text("price_tier", { enum: PRICE_TIERS }).notNull(),
    title: text("title"),
    titleSource: text("title_source", { enum: FIELD_SOURCES }),
    description: text("description"),
    descriptionSource: text("description_source", { enum: FIELD_SOURCES }),
    altText: text("alt_text"),
    altTextSource: text("alt_text_source", { enum: FIELD_SOURCES }),
    // As captured: local time without a zone, plus the offset when the camera recorded one.
    dateTaken: timestamp("date_taken", { withTimezone: false, mode: "string" }),
    dateTakenOffset: text("date_taken_offset"),
    cameraMake: text("camera_make"),
    cameraModel: text("camera_model"),
    lens: text("lens"),
    exposureTime: text("exposure_time"),
    fNumber: real("f_number"),
    focalLength: real("focal_length"),
    iso: integer("iso"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("images_batch_id_idx").on(t.batchId),
    index("images_uploaded_by_idx").on(t.uploadedBy),
    index("images_processing_state_idx").on(t.processingState),
    check("images_status_check", sql`${t.status} in ('draft', 'published', 'archived')`),
    check(
      "images_processing_state_check",
      sql`${t.processingState} in ('uploading', 'queued', 'generating', 'ready', 'failed')`,
    ),
    check("images_visibility_check", sql`${t.visibility} in ('internal', 'restricted', 'public')`),
    check("images_price_tier_check", sql`${t.priceTier} in ('free', 'paid')`),
    check("images_title_source_check", sql`${t.titleSource} in ('embedded', 'ai', 'staff')`),
    check("images_description_source_check", sql`${t.descriptionSource} in ('embedded', 'ai', 'staff')`),
    check("images_alt_text_source_check", sql`${t.altTextSource} in ('embedded', 'ai', 'staff')`),
  ],
);

// One row per stored file. v1 has one per image; the table is the FR-43 seam (AD-15).
export const fileVersions = pgTable(
  "file_versions",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    imageId: uuid("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    // SHA-256 of the original, hex. Unique: a byte-identical file is a duplicate (FR-10a, AD-11).
    hash: text("hash").notNull(),
    mediaType: text("media_type", { enum: ["image/jpeg", "image/png"] }).notNull(),
    byteSize: bigint("byte_size", { mode: "number" }).notNull(),
    // Oriented: as the image is shown, after EXIF orientation is applied.
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("file_versions_hash_unique").on(t.hash),
    index("file_versions_image_id_idx").on(t.imageId),
    check("file_versions_media_type_check", sql`${t.mediaType} in ('image/jpeg', 'image/png')`),
  ],
);

// Keywords carry their source (AD-10); category is set for ai rows only.
export const imageKeywords = pgTable(
  "image_keywords",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    imageId: uuid("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    source: text("source", { enum: ["embedded", "shared", "ai", "staff"] }).notNull(),
    category: text("category"),
  },
  (t) => [
    uniqueIndex("image_keywords_image_id_keyword_unique").on(t.imageId, sql`lower(${t.keyword})`),
    check("image_keywords_source_check", sql`${t.source} in ('embedded', 'shared', 'ai', 'staff')`),
  ],
);
