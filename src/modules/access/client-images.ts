import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, type Tx } from "@/db/client";
import { fileVersions, imageKeywords, images, licenceTypes } from "@/db/schema";
import { DEFAULT_TENANT_ID } from "@/db/tenant";
import { assertContact, type Actor } from "@/modules/auth";
import { displayTitle, LIBRARY_PAGE_SIZE, pageWindow } from "@/modules/images";
import { accessFlags, ownedBy, visibleTo, type AccessFlags } from "./visibility";

// A paid image's price from its licence type (AD-6, AD-18), or "free".
export type ClientPrice = { licenceTypeId: string; priceMinor: number; currency: string } | "free";

// Everything a client route gets about an image (AD-6). Built from the explicit column list below: never
// coordinates, place names, field sources, client lists, filenames or other staff-only fields.
export type ClientImage = {
  id: string;
  title: string;
  description: string | null;
  altText: string | null;
  keywords: string[];
  dateTaken: string | null;
  cameraMake: string | null;
  cameraModel: string | null;
  lens: string | null;
  exposureTime: string | null;
  fNumber: number | null;
  focalLength: number | null;
  iso: number | null;
  width: number | null;
  height: number | null;
  price: ClientPrice;
  // The latest file version, for the thumbnail and preview routes (AD-15).
  fileVersionId: string | null;
} & AccessFlags;

// The latest file version's column; null while an image has no file.
function latestVersion<T>(column: "id" | "width" | "height") {
  return sql<T | null>`(select fv.${sql.identifier(column)} from ${fileVersions} fv where fv.image_id = ${images}.id order by fv.created_at desc, fv.id desc limit 1)`;
}

function clientColumns(clientId: string) {
  return {
    id: images.id,
    title: images.title,
    description: images.description,
    altText: images.altText,
    dateTaken: images.dateTaken,
    cameraMake: images.cameraMake,
    cameraModel: images.cameraModel,
    lens: images.lens,
    exposureTime: images.exposureTime,
    fNumber: images.fNumber,
    focalLength: images.focalLength,
    iso: images.iso,
    width: latestVersion<number>("width"),
    height: latestVersion<number>("height"),
    fileVersionId: latestVersion<string>("id"),
    keywords: sql<string[]>`array(select k.keyword from ${imageKeywords} k where k.image_id = ${images}.id order by k.keyword)`,
    // Read to compute the flags and price; not part of ClientImage.
    visibility: images.visibility,
    priceTier: images.priceTier,
    own: sql<boolean>`${ownedBy(clientId)}`,
  };
}

function selectClientRows(clientId: string) {
  return getDb().select(clientColumns(clientId)).from(images).$dynamic();
}

type ClientRow = Awaited<ReturnType<typeof selectClientRows>>[number];

type PaidPrice = Exclude<ClientPrice, "free">;

// The licence type a paid image is sold under (the oldest of the tenant's, as licences.currentLicenceType).
// Read here, not through the licences module, which itself calls access (AD-3: access calls only images).
async function currentPrice(db: Tx): Promise<PaidPrice | null> {
  const [row] = await db
    .select({ licenceTypeId: licenceTypes.id, priceMinor: licenceTypes.priceMinor, currency: licenceTypes.currency })
    .from(licenceTypes)
    .where(eq(licenceTypes.tenantId, DEFAULT_TENANT_ID))
    .orderBy(asc(licenceTypes.createdAt), asc(licenceTypes.id))
    .limit(1);
  return row ?? null;
}

function toClientImage(row: ClientRow, paidPrice: PaidPrice | null): ClientImage {
  if (row.priceTier === "paid" && !paidPrice) throw new Error("A paid image has no licence type; the seed creates it.");
  return {
    id: row.id,
    title: displayTitle(row.title),
    description: row.description,
    altText: row.altText,
    keywords: row.keywords,
    dateTaken: row.dateTaken,
    cameraMake: row.cameraMake,
    cameraModel: row.cameraModel,
    lens: row.lens,
    exposureTime: row.exposureTime,
    fNumber: row.fNumber,
    focalLength: row.focalLength,
    iso: row.iso,
    width: row.width,
    height: row.height,
    price: row.priceTier === "paid" ? paidPrice! : "free",
    fileVersionId: row.fileVersionId,
    ...accessFlags(row),
  };
}

// Find images (FR-28, first cut): the images visible to the contact's client, newest first, 48 a page,
// with the total from the same condition. A page past the end gives the last page.
export async function listClientImages(
  actor: Actor,
  page: number,
): Promise<{ items: ClientImage[]; total: number; page: number; pageCount: number }> {
  assertContact(actor);
  const db = getDb();
  const visible = visibleTo(actor.clientId);
  const [{ total }] = await db.select({ total: count() }).from(images).where(visible);
  const window = pageWindow(page, total);
  const rows = await selectClientRows(actor.clientId)
    .where(visible)
    .orderBy(desc(images.createdAt), desc(images.id))
    .limit(LIBRARY_PAGE_SIZE)
    .offset(window.offset);
  const paidPrice = await currentPrice(db);
  return { items: rows.map((row) => toClientImage(row, paidPrice)), total, page: window.page, pageCount: window.pageCount };
}

// One image for the contact's client, or null when it does not exist or is not visible to them. Every
// route turns null into 404, never 403 (AD-6).
export async function getClientImage(actor: Actor, imageId: string): Promise<ClientImage | null> {
  assertContact(actor);
  if (!z.uuid().safeParse(imageId).success) return null;
  const [row] = await selectClientRows(actor.clientId).where(and(eq(images.id, imageId), visibleTo(actor.clientId)));
  if (!row) return null;
  return toClientImage(row, await currentPrice(getDb()));
}
