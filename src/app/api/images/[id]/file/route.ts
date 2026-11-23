import { z } from "zod";
import { assertSameOrigin, requireStaff } from "@/modules/auth";
import { completeUpload, UploadRejected } from "@/modules/images";
import { NotFound, toErrorResponse } from "@/modules/shared/errors";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };

function contentLengthOf(request: Request): number | null {
  const value = Number(request.headers.get("content-length") ?? NaN);
  return Number.isFinite(value) ? value : null;
}

// Receives one file of an upload as the raw request body (AD-11). The image row was created first by
// the Upload page's Server Action. Answers { status: "ready", title, thumbnailUrl } or, for a file that
// was not added, { status: "rejected", reason } with a 4xx status.
export async function PUT(request: Request, { params }: RouteContext<"/api/images/[id]/file">) {
  const actor = await requireStaff();
  try {
    assertSameOrigin(request);
    const id = z.uuid().safeParse((await params).id);
    if (!id.success) throw new NotFound();
    const result = await completeUpload(actor, id.data, request.body ?? new Blob().stream(), contentLengthOf(request));
    return Response.json({ status: "ready", ...result }, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof UploadRejected) {
      return Response.json({ status: "rejected", reason: error.reason }, { status: error.status, headers: NO_STORE });
    }
    return toErrorResponse(error);
  }
}
