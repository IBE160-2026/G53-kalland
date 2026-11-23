import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { EmptyState, PageMain } from "@/app/_components/shell/shell";
import { requireContact } from "@/modules/auth";

// Placeholder so the Find images tab and the header search lead somewhere; story 1.8 replaces it.
export default async function FindImagesPage() {
  await requireContact();
  const t = await getTranslations("findImages");
  return (
    <PageMain>
      <Heading level={1} className="visually-hidden">
        {t("title")}
      </Heading>
      <EmptyState text={t("empty")} />
    </PageMain>
  );
}
