import NextLink from "next/link";
import { Heading, Link, Paragraph } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";

// Shown with status 403 when a guard calls forbidden(): a user on the other role's route (AD-5, S6).
// Rendered outside the shells, so it has no navigation.
export default async function Forbidden() {
  const t = await getTranslations("forbidden");
  return (
    <main className="centred-page">
      <div className="centred-card">
        <Heading level={1} className="page-title">
          {t("title")}
        </Heading>
        <Paragraph>{t("body")}</Paragraph>
        <Link asChild>
          <NextLink href="/">{t("home")}</NextLink>
        </Link>
      </div>
    </main>
  );
}
