import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { imageKeywords, images } from "@/db/schema";
import type { Actor } from "@/modules/auth";
import { createUploadRows } from "@/modules/images";

type ImageState = Partial<
  Pick<
    typeof images.$inferInsert,
    "status" | "processingState" | "visibility" | "priceTier" | "title" | "description" | "altText" | "publishedAt"
  >
>;

// A fresh image row for Library and publish tests (AD-7): created through the images module, then set to
// the state the test needs. By default a `ready` draft with every agency field and one keyword.
export async function createLibraryImage(actor: Actor, state: ImageState & { keywords?: string[] } = {}): Promise<string> {
  const db = getDb();
  const { keywords = ["harbour"], ...columns } = state;
  const {
    images: [row],
  } = await createUploadRows(db, actor, { filenames: [`library-${crypto.randomUUID()}.jpg`] });
  await db
    .update(images)
    .set({ processingState: "ready", title: "Harbour", description: "Boats in a harbour.", altText: "Boats moored in a harbour.", ...columns })
    .where(eq(images.id, row.id));
  if (keywords.length > 0) {
    await db.insert(imageKeywords).values(keywords.map((keyword) => ({ imageId: row.id, keyword, source: "staff" as const })));
  }
  return row.id;
}

export async function imageRow(imageId: string) {
  const [row] = await getDb().select().from(images).where(eq(images.id, imageId));
  return row;
}
