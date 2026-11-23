import { requireUser } from "@/modules/auth";
import { serveDerivedFile } from "../../derived-file";

export const dynamic = "force-dynamic";

// An image's thumbnail, for staff and for contacts who may see the image (AD-6, AD-15).
export async function GET(_request: Request, { params }: RouteContext<"/api/images/[id]/thumbnail">) {
  const actor = await requireUser();
  return serveDerivedFile(actor, params, "thumbnail");
}
