import { Readable } from "node:stream";
import { z } from "zod";
import { getClientImage } from "@/modules/access";
import type { Actor } from "@/modules/auth";
import { getDerivedFile } from "@/modules/images";
import { openDerivedFile, type DerivedKind } from "@/modules/media";
import { NotFound, toErrorResponse } from "@/modules/shared/errors";

// Serves an image's thumbnail or preview (AD-15). A contact gets it only when access says the image is
// visible to their client, else 404 (AD-6); staff get any image's. Never cached (AD-4); GET never writes.
// The route calls requireUser() first and passes the Actor in.
export async function serveDerivedFile(actor: Actor, params: Promise<{ id: string }>, kind: DerivedKind): Promise<Response> {
  try {
    const id = z.uuid().safeParse((await params).id);
    if (!id.success) throw new NotFound();
    let file: Readable;
    if (actor.role === "contact") {
      const image = await getClientImage(actor, id.data);
      if (!image?.fileVersionId) throw new NotFound();
      file = await openDerivedFile(image.fileVersionId, kind);
    } else {
      file = await getDerivedFile(actor, id.data, kind);
    }
    return new Response(Readable.toWeb(file) as ReadableStream<Uint8Array>, {
      headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
