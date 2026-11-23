import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { EmptyState, PageMain } from "@/app/_components/shell/shell";
import { requireStaff } from "@/modules/auth";

// Placeholder so the Upload tab leads somewhere; story 1.4 replaces it.
export default async function UploadPage() {
  await requireStaff();
  const t = await getTranslations("upload");
  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("title")}
      </Heading>
      <EmptyState text={t("empty")} />
    </PageMain>
  );
}
