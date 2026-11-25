import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { clients, licences, licenceTypes, users } from "@/db/schema";
import { assertContact, assertStaff, type Actor } from "@/modules/auth";
import { displayTitle } from "@/modules/images";

// One row of the staff Licences tab (FR-41, first cut), from the facts stored with the licence.
export type LicenceLogRow = {
  id: string;
  clientName: string;
  contactName: string | null;
  imageTitle: string;
  licenceTypeName: string;
  priceMinor: number;
  currency: string;
  createdAt: Date;
};

// The transaction log for staff: every licence, newest first. Filters and paging come with Epic 5.
export async function listLicences(actor: Actor): Promise<LicenceLogRow[]> {
  assertStaff(actor);
  const rows = await getDb()
    .select({
      id: licences.id,
      clientName: clients.name,
      contactName: users.name,
      imageTitle: licences.imageTitle,
      licenceTypeName: licenceTypes.name,
      priceMinor: licences.priceMinor,
      currency: licences.currency,
      createdAt: licences.createdAt,
    })
    .from(licences)
    .innerJoin(clients, eq(clients.id, licences.clientId))
    .innerJoin(licenceTypes, eq(licenceTypes.id, licences.licenceTypeId))
    .leftJoin(users, eq(users.id, licences.contactId))
    .orderBy(desc(licences.createdAt), desc(licences.id));
  return rows.map((row) => ({ ...row, imageTitle: displayTitle(row.imageTitle) }));
}

// What the checkout confirmation shows of one licence.
export type ClientLicence = {
  id: string;
  imageId: string;
  imageTitle: string;
  licenceTypeName: string;
  priceMinor: number;
  currency: string;
  createdAt: Date;
};

// One licence of the contact's own client, or null when it does not exist or belongs to another client
// (the route turns null into 404).
export async function getClientLicence(actor: Actor, licenceId: string): Promise<ClientLicence | null> {
  assertContact(actor);
  if (!z.uuid().safeParse(licenceId).success) return null;
  const [row] = await getDb()
    .select({
      id: licences.id,
      imageId: licences.imageId,
      imageTitle: licences.imageTitle,
      licenceTypeName: licenceTypes.name,
      priceMinor: licences.priceMinor,
      currency: licences.currency,
      createdAt: licences.createdAt,
    })
    .from(licences)
    .innerJoin(licenceTypes, eq(licenceTypes.id, licences.licenceTypeId))
    .where(and(eq(licences.id, licenceId), eq(licences.clientId, actor.clientId)));
  return row ? { ...row, imageTitle: displayTitle(row.imageTitle) } : null;
}
