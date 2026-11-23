"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert, Button, Field, Input, Label } from "@digdir/designsystemet-react";
import { logIn, type LoginState } from "./actions";

export function LoginForm({ returnTo, initialError }: { returnTo?: string; initialError?: string }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState<LoginState, FormData>(logIn, { error: initialError });

  return (
    <form className="form-stack" action={formAction}>
      {state.error && (
        <Alert role="alert" data-color="danger" data-size="sm">
          {t(state.error)}
        </Alert>
      )}
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
      <Field>
        <Label htmlFor="email">{t("login.email")}</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} />
      </Field>
      <Field>
        <Label htmlFor="password">{t("login.password")}</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" loading={pending} disabled={pending}>
        {t("login.submit")}
      </Button>
    </form>
  );
}
