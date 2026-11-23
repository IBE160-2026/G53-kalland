import NextLink from "next/link";
import { Heading, Link, Paragraph } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";

// Shown with status 404 when a page calls notFound(), and for unknown addresses: anything that does not
// exist or that a contact may not see (AD-6). Rendered outside the shells, so it has no navigation.
export default async function NotFound() {
  const t = await getTranslations();
  return (
    <main className="centred-page">
      <div className="centred-card">
        <Heading level={1} className="page-title">
          {t("notFound.title")}
        </Heading>
        <Paragraph>{t("errors.notFound")}</Paragraph>
        <Link asChild>
          <NextLink href="/">{t("notFound.home")}</NextLink>
        </Link>
      </div>
    </main>
  );
}
