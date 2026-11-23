import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/app/_components/logout-button";
import { getUser } from "@/modules/accounts";
import { requireContact } from "@/modules/auth";

// Client landing page. A placeholder until the client dashboard arrives (1.3, 1.8).
export default async function OverviewPage() {
  const actor = await requireContact();
  const [user, t] = await Promise.all([getUser(actor.userId), getTranslations()]);
  return (
    <main>
      <h1>{t("overview.title")}</h1>
      <p>{t("session.signedInAs", { name: user.name })}</p>
      <LogoutButton />
    </main>
  );
}
