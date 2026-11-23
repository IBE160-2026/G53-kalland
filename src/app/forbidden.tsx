import Link from "next/link";
import { getTranslations } from "next-intl/server";

// Shown with status 403 when a guard calls forbidden(): a user on the other role's route (AD-5, S6).
export default async function Forbidden() {
  const t = await getTranslations("forbidden");
  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("body")}</p>
      <Link href="/">{t("home")}</Link>
    </main>
  );
}
