import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { safeReturnTo } from "@/modules/auth";
import { LoginForm } from "./login-form";

// Public. `reason=inactive` comes from a guard that refused a deactivated user or client.
// One centred form on the canvas, without navigation (UX-DR-9).
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { returnTo, reason } = await searchParams;
  const t = await getTranslations();
  return (
    <main className="centred-page">
      <div className="centred-card">
        <p className="wordmark">
          <span className="wordmark-mark" aria-hidden="true" />
          {t("app.name")}
        </p>
        <Heading level={1} className="page-title">
          {t("login.title")}
        </Heading>
        <LoginForm
          returnTo={safeReturnTo(returnTo) ?? undefined}
          initialError={reason === "inactive" ? "login.inactive" : undefined}
        />
      </div>
    </main>
  );
}
