import { and, eq, or, sql, type SQL } from "drizzle-orm";
import { imageClients, images, licences } from "@/db/schema";

// The one rule for what a client gets (AD-6). Each function is an SQL condition on the outer `images` row,
// so every client list, count, page and file uses the same text. Drizzle leaves column names unqualified
// in a single-table select, so the subquery names its own table with an alias.

// The client is on the image's restricted list. An empty list matches no client (S4).
function listed(clientId: string): SQL {
  return sql`exists (select 1 from ${imageClients} ic where ic.image_id = ${images}.id and ic.client_id = ${clientId})`;
}

// The client holds an active (unrevoked) licence for the image, whatever its status or visibility now
// (A3, A6, A8, A10, A12). Access only reads the licences table; the licences module writes it (AD-18).
function licensed(clientId: string): SQL {
  return sql`exists (select 1 from ${licences} l where l.image_id = ${images}.id and l.client_id = ${clientId} and l.revoked_at is null)`;
}

// Own: published, free and restricted to a list that includes the client (A4), or licensed to the client.
export function ownedBy(clientId: string): SQL {
  return or(
    and(eq(images.status, "published"), eq(images.priceTier, "free"), eq(images.visibility, "restricted"), listed(clientId)),
    licensed(clientId),
  )!;
}

// Visible: published and (public, or restricted with the client on the list), or own.
export function visibleTo(clientId: string): SQL {
  return or(
    and(
      eq(images.status, "published"),
      or(eq(images.visibility, "public"), and(eq(images.visibility, "restricted"), listed(clientId))),
    ),
    ownedBy(clientId),
  )!;
}

export type AccessFlags = { own: boolean; canDownload: boolean; canBuy: boolean };

// The flags of an image that is visible to the client (every row that reaches this is published, or own):
// canDownload = own, or public and free (A1); canBuy = paid and not own (A2, A5).
export function accessFlags(image: {
  own: boolean;
  visibility: (typeof images.$inferSelect)["visibility"];
  priceTier: (typeof images.$inferSelect)["priceTier"];
}): AccessFlags {
  return {
    own: image.own,
    canDownload: image.own || (image.visibility === "public" && image.priceTier === "free"),
    canBuy: image.priceTier === "paid" && !image.own,
  };
}

// Whether a client may see an image's location (GPS or place name). The seam for a later map search;
// false in v1, so client search and pages never use location.
export function clientMaySeeLocation(): boolean {
  return false;
}
