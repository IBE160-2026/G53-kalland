import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { PageMain } from "@/app/_components/shell/shell";
import { requireStaff } from "@/modules/auth";
import { listBatchUploads } from "@/modules/images";
import { UploadWorkspace } from "./upload-workspace";

// Upload (FR-8). `?batch=<id>` reopens one of the user's own batches with its stored rows; any other
// value gives a fresh page.
export default async function UploadPage({ searchParams }: PageProps<"/upload">) {
  const actor = await requireStaff();
  const t = await getTranslations("upload");
  const batchId = z.uuid().safeParse((await searchParams).batch);
  const batch = batchId.success ? await listBatchUploads(actor, batchId.data) : null;
  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("title")}
      </Heading>
      <UploadWorkspace key={batch?.batchId ?? "new"} batch={batch} />
    </PageMain>
  );
}
