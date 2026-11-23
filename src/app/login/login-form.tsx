"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { logIn, type LoginState } from "./actions";

export function LoginForm({ returnTo, initialError }: { returnTo?: string; initialError?: string }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState<LoginState, FormData>(logIn, { error: initialError });

  return (
    <form action={formAction}>
      {state.error && <p role="alert">{t(state.error)}</p>}
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
      <p>
        <label htmlFor="email">{t("login.email")}</label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} />
      </p>
      <p>
        <label htmlFor="password">{t("login.password")}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </p>
      <button type="submit" disabled={pending}>
        {t("login.submit")}
      </button>
    </form>
  );
}
