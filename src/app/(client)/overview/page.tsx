import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { EmptyState, PageMain } from "@/app/_components/shell/shell";
import { requireContact } from "@/modules/auth";

// Client landing page. Empty until the agency shares images (1.8). No Context sidebar here.
export default async function OverviewPage() {
  await requireContact();
  const t = await getTranslations("overview");
  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("title")}
      </Heading>
      <EmptyState text={t("empty")} />
    </PageMain>
  );
}
