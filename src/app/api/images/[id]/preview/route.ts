import { requireUser } from "@/modules/auth";
import { serveDerivedFile } from "../../derived-file";

export const dynamic = "force-dynamic";

// An image's preview (at most 800 px), for staff and for contacts who may see the image (AD-6, AD-15).
export async function GET(_request: Request, { params }: RouteContext<"/api/images/[id]/preview">) {
  const actor = await requireUser();
  return serveDerivedFile(actor, params, "preview");
}
