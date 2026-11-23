import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/app/_components/logout-button";
import { getUser } from "@/modules/accounts";
import { requireStaff } from "@/modules/auth";

// Staff landing page. A placeholder until the library arrives (1.3, 1.4).
export default async function LibraryPage() {
  const actor = await requireStaff();
  const [user, t] = await Promise.all([getUser(actor.userId), getTranslations()]);
  return (
    <main>
      <h1>{t("library.title")}</h1>
      <p>{t("session.signedInAs", { name: user.name })}</p>
      <LogoutButton />
    </main>
  );
}
