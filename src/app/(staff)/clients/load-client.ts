import { notFound } from "next/navigation";
import { z } from "zod";
import { getClientDetails, getContactForStaff, type ClientDetails, type Contact } from "@/modules/accounts";
import type { Actor } from "@/modules/auth";
import { NotFound } from "@/modules/shared/errors";

// The client of a /clients/<id> route, or the Not found page for an unknown or malformed id.
export async function loadClient(actor: Actor, id: string): Promise<ClientDetails> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) notFound();
  try {
    return await getClientDetails(actor, parsed.data);
  } catch (error) {
    if (error instanceof NotFound) notFound();
    throw error;
  }
}

// The contact of a /clients/<id>/contacts/<contactId> route, or the Not found page when the id is
// malformed, unknown, a staff user's, or a contact of another client.
export async function loadContact(actor: Actor, client: ClientDetails, contactId: string): Promise<Contact> {
  const parsed = z.uuid().safeParse(contactId);
  if (!parsed.success) notFound();
  let contact: Contact;
  try {
    contact = await getContactForStaff(actor, parsed.data);
  } catch (error) {
    if (error instanceof NotFound) notFound();
    throw error;
  }
  if (contact.clientId !== client.id) notFound();
  return contact;
}
