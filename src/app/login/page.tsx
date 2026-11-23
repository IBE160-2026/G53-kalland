import { getTranslations } from "next-intl/server";
import { safeReturnTo } from "@/modules/auth";
import { LoginForm } from "./login-form";

// Public. `reason=inactive` comes from a guard that refused a deactivated user or client.
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { returnTo, reason } = await searchParams;
  const t = await getTranslations("login");
  return (
    <main>
      <h1>{t("title")}</h1>
      <LoginForm
        returnTo={safeReturnTo(returnTo) ?? undefined}
        initialError={reason === "inactive" ? "login.inactive" : undefined}
      />
    </main>
  );
}
