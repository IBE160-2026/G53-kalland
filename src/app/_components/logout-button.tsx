import { getTranslations } from "next-intl/server";
import { logOut } from "./actions";

export async function LogoutButton() {
  const t = await getTranslations("session");
  return (
    <form action={logOut}>
      <button type="submit">{t("logout")}</button>
    </form>
  );
}
