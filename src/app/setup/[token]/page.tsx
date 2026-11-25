import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { isSetupLinkValid, LOGIN_PATH } from "@/modules/auth";
import { setPasswordFromLink } from "./actions";
import { SetPasswordForm } from "./set-password-form";

// The token is in the path, so the page sends no Referer anywhere.
export const metadata: Metadata = { referrer: "no-referrer" };

// Public: the setup link is the credential (FR-4). One centred form on the canvas, without navigation,
// like Login (UX-DR-9). Opening it only reads; a used, expired, cancelled or unknown link goes to Login
// with the expired message (S8).
export default async function SetupPage({ params }: PageProps<"/setup/[token]">) {
  const { token } = await params;
  if (!(await isSetupLinkValid(token))) redirect(`${LOGIN_PATH}?reason=expired`);
  const t = await getTranslations();
  return (
    <main className="centred-page">
      <div className="centred-card">
        <p className="wordmark">
          <span className="wordmark-mark" aria-hidden="true" />
          {t("app.name")}
        </p>
        <Heading level={1} className="page-title">
          {t("setPassword.title")}
        </Heading>
        <p>{t("setPassword.intro")}</p>
        <SetPasswordForm action={setPasswordFromLink.bind(null, token)} />
      </div>
    </main>
  );
}
