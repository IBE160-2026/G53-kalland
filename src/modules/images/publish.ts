import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { clients, imageClients, images } from "@/db/schema";
import { assertStaff, type Actor } from "@/modules/auth";
import { Conflict, NotFound, Validation } from "@/modules/shared/errors";

type Image = typeof images.$inferSelect;

export type AccessInput = {
  // The version the form loaded (AD-8).
  version: number;
  visibility: Image["visibility"];
  priceTier: Image["priceTier"];
  // The restricted list as a diff, so a save never re-adds a client someone else removed (AD-8).
  clients: { added: string[]; removed: string[] };
};

// Publishes a draft (FR-19a, AD-8): one conditional update from `draft` with processing `ready` or
// `failed` to `published`, setting `publishedAt`. A published image never returns to draft. Returns true
// when this call published it. Publishing an image that is already published changes nothing; an image
// still `uploading`, `queued` or `generating` is refused with a reason.
export async function publishImage(actor: Actor, imageId: string): Promise<boolean> {
  assertStaff(actor);
  const db = getDb();
  const published = await db
    .update(images)
    .set({
      status: "published",
      publishedAt: sql`coalesce(${images.publishedAt}, now())`,
      version: sql`${images.version} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(images.id, imageId), eq(images.status, "draft"), inArray(images.processingState, ["ready", "failed"])))
    .returning({ id: images.id });
  if (published.length > 0) return true;

  // Nothing was written; the row only tells why.
  const [row] = await db
    .select({ status: images.status, processingState: images.processingState })
    .from(images)
    .where(eq(images.id, imageId));
  if (!row) throw new NotFound();
  if (row.status === "published") return false;
  if (row.status === "draft") throw new Validation("errors.publishNotReady");
  throw new Conflict();
}

// Saves an image's visibility, price tier and restricted list in one transaction (FR-21, AD-8). The update
// is conditional on the loaded `version` and bumps it; a mismatch writes nothing and throws Conflict with
// the NFR-7 failed-save message. Only active clients may be added; any other visibility than Restricted
// deletes the list. `visibleToAllSince` is set when the image becomes public and cleared when it stops
// being public (AD-6).
export async function saveAccess(actor: Actor, imageId: string, input: AccessInput): Promise<{ version: number }> {
  assertStaff(actor);
  // Only a restricted image keeps a list; leaving Restricted clears it, and `added` is ignored.
  const restricted = input.visibility === "restricted";
  const added = restricted ? [...new Set(input.clients.added)] : [];
  const removed = [...new Set(input.clients.removed)].filter((id) => !added.includes(id));
  return getDb().transaction(async (tx) => {
    if (added.length > 0) {
      const active = await tx
        .select({ id: clients.id })
        .from(clients)
        .where(and(inArray(clients.id, added), eq(clients.status, "active")));
      if (active.length !== added.length) throw new Validation();
    }
    const [saved] = await tx
      .update(images)
      .set({
        visibility: input.visibility,
        priceTier: input.priceTier,
        visibleToAllSince:
          input.visibility === "public"
            ? sql`case when ${images.visibility} = 'public' then ${images.visibleToAllSince} else now() end`
            : null,
        version: sql`${images.version} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(images.id, imageId), eq(images.version, input.version)))
      .returning({ version: images.version });
    if (!saved) throw new Conflict("errors.saveFailed");
    if (added.length > 0) {
      await tx
        .insert(imageClients)
        .values(added.map((clientId) => ({ imageId, clientId })))
        .onConflictDoNothing();
    }
    if (!restricted) {
      await tx.delete(imageClients).where(eq(imageClients.imageId, imageId));
    } else if (removed.length > 0) {
      await tx.delete(imageClients).where(and(eq(imageClients.imageId, imageId), inArray(imageClients.clientId, removed)));
    }
    return saved;
  });
}
