import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { PageMain } from "@/app/_components/shell/shell";
import { requireStaff } from "@/modules/auth";

// The Clients tab with no client open.
export default async function ClientsPage() {
  await requireStaff();
  const t = await getTranslations("clients");
  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("title")}
      </Heading>
      <p className="muted">{t("choose")}</p>
    </PageMain>
  );
}
