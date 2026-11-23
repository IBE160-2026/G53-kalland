import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./accounts.ts";
import { images } from "./images.ts";

// Owned by the ai module (AD-3). One row per generation run, success or error (AD-21).
export const metadataGenerations = pgTable(
  "metadata_generations",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    imageId: uuid("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    promptVersion: text("prompt_version").notNull(),
    outcome: text("outcome", { enum: ["success", "error"] }).notNull(),
    errorCategory: text("error_category"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    latencyMs: integer("latency_ms").notNull(),
    // What the provider answered, as text. Untrusted; never rendered unescaped.
    rawOutput: text("raw_output"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("metadata_generations_image_id_idx").on(t.imageId),
    check("metadata_generations_outcome_check", sql`${t.outcome} in ('success', 'error')`),
  ],
);
