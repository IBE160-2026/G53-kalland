import { notFound } from "next/navigation";
import { z } from "zod";
import { getClientDetails, type ClientDetails } from "@/modules/accounts";
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
