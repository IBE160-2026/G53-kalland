import { asc, count, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { clients, fileVersions, imageClients, imageKeywords, images } from "@/db/schema";
import { assertStaff, type Actor } from "@/modules/auth";
import { displayTitle } from "./display";

export const LIBRARY_PAGE_SIZE = 48;

// Offset paging for an image wall (Conventions: Lists): 1-based, a page past the end gives the last page.
export function pageWindow(page: number, total: number): { page: number; pageCount: number; offset: number } {
  const pageCount = Math.max(1, Math.ceil(total / LIBRARY_PAGE_SIZE));
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), pageCount);
  return { page: current, pageCount, offset: (current - 1) * LIBRARY_PAGE_SIZE };
}

type Image = typeof images.$inferSelect;

export type LibraryItem = {
  id: string;
  title: string;
  status: Image["status"];
  processingState: Image["processingState"];
  visibility: Image["visibility"];
  priceTier: Image["priceTier"];
  clientNames: string[];
  width: number | null;
  height: number | null;
  version: number;
};

// The agency fields a draft should have before it is published (FR-19a). Shared by the publish dialog and
// the later batch publish (3.15).
export const METADATA_FIELDS = ["title", "description", "altText", "keywords"] as const;
export type MetadataField = (typeof METADATA_FIELDS)[number];

export type LibraryImage = LibraryItem & {
  filename: string;
  description: string | null;
  altText: string | null;
  keywords: string[];
  publishedAt: Date | null;
  clients: { id: string; name: string }[];
  missingFields: MetadataField[];
};

// Drizzle leaves column names unqualified in a single-table select, so these correlated subqueries name
// their tables with aliases and the outer row as "images".

// The latest file version's oriented size; null while the image is still uploading.
function latestVersion(column: "width" | "height") {
  return sql<number | null>`(select fv.${sql.identifier(column)} from ${fileVersions} fv where fv.image_id = ${images}.id order by fv.created_at desc, fv.id desc limit 1)`;
}

const itemColumns = {
  id: images.id,
  title: images.title,
  status: images.status,
  processingState: images.processingState,
  visibility: images.visibility,
  priceTier: images.priceTier,
  version: images.version,
  width: latestVersion("width"),
  height: latestVersion("height"),
  // The restricted list's client names, for the tile's meta line.
  clientNames: sql<string[]>`array(select c.name from ${imageClients} ic join ${clients} c on c.id = ic.client_id where ic.image_id = ${images}.id order by c.name)`,
};

// The Library wall (FR-29, staff): every image, drafts included, newest first, 48 a page. A page past the
// end gives the last page.
export async function listLibrary(
  actor: Actor,
  page: number,
): Promise<{ items: LibraryItem[]; total: number; page: number; pageCount: number }> {
  assertStaff(actor);
  const db = getDb();
  const [{ total }] = await db.select({ total: count() }).from(images);
  const { page: current, pageCount, offset } = pageWindow(page, total);
  const rows = await db
    .select(itemColumns)
    .from(images)
    .orderBy(desc(images.createdAt), desc(images.id))
    .limit(LIBRARY_PAGE_SIZE)
    .offset(offset);
  return { items: rows.map((row) => ({ ...row, title: displayTitle(row.title) })), total, page: current, pageCount };
}

function isBlank(value: string | null): boolean {
  return !value?.trim();
}

// One image for the Details panel, or null when it does not exist.
export async function getLibraryImage(actor: Actor, imageId: string): Promise<LibraryImage | null> {
  assertStaff(actor);
  const db = getDb();
  const [row] = await db
    .select({
      ...itemColumns,
      filename: images.filename,
      description: images.description,
      altText: images.altText,
      publishedAt: images.publishedAt,
    })
    .from(images)
    .where(eq(images.id, imageId));
  if (!row) return null;
  const keywordRows = await db
    .select({ keyword: imageKeywords.keyword })
    .from(imageKeywords)
    .where(eq(imageKeywords.imageId, imageId))
    .orderBy(asc(imageKeywords.keyword));
  const listed = await db
    .select({ id: clients.id, name: clients.name })
    .from(imageClients)
    .innerJoin(clients, eq(clients.id, imageClients.clientId))
    .where(eq(imageClients.imageId, imageId))
    .orderBy(asc(clients.name), asc(clients.id));
  const keywords = keywordRows.map((k) => k.keyword);
  const present: Record<MetadataField, boolean> = {
    title: !isBlank(row.title),
    description: !isBlank(row.description),
    altText: !isBlank(row.altText),
    keywords: keywords.length > 0,
  };
  return {
    ...row,
    title: displayTitle(row.title),
    keywords,
    clients: listed,
    missingFields: METADATA_FIELDS.filter((field) => !present[field]),
  };
}
