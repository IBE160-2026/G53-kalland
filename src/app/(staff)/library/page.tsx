import { Heading, Link } from "@digdir/designsystemet-react";
import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { ContextSidebar } from "@/app/_components/shell/sidebar";
import { EmptyState, PageMain } from "@/app/_components/shell/shell";
import { requireStaff } from "@/modules/auth";

// Staff landing page. Empty until the library gets images (1.4); the filters replace the sidebar note then.
export default async function LibraryPage() {
  await requireStaff();
  const t = await getTranslations("library");
  return (
    <>
      <ContextSidebar label={t("filters")} toggleLabel={t("filtersToggle")}>
        <h2 className="sidebar-heading">{t("filters")}</h2>
        <p className="muted">{t("filtersEmpty")}</p>
      </ContextSidebar>
      <PageMain>
        <Heading level={1} className="visually-hidden">
          {t("title")}
        </Heading>
        <EmptyState
          text={t("empty")}
          action={
            <Link asChild>
              <NextLink href="/upload">{t("emptyAction")}</NextLink>
            </Link>
          }
        />
      </PageMain>
    </>
  );
}
