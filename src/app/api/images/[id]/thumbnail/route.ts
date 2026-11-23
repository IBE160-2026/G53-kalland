import { Readable } from "node:stream";
import { z } from "zod";
import { requireStaff } from "@/modules/auth";
import { getThumbnail } from "@/modules/images";
import { NotFound, toErrorResponse } from "@/modules/shared/errors";

export const dynamic = "force-dynamic";

// A staff thumbnail (AD-15). Files reach the browser only through guarded Route Handlers, never cached.
export async function GET(_request: Request, { params }: RouteContext<"/api/images/[id]/thumbnail">) {
  const actor = await requireStaff();
  try {
    const id = z.uuid().safeParse((await params).id);
    if (!id.success) throw new NotFound();
    const file = await getThumbnail(actor, id.data);
    return new Response(Readable.toWeb(file) as ReadableStream<Uint8Array>, {
      headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
