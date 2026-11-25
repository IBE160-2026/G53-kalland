"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert, Button, Field, Input, Label, ValidationMessage } from "@digdir/designsystemet-react";
import type { SetPasswordState } from "./actions";

// One password field, no confirm field (FR-4). A password of the wrong length is shown inline.
export function SetPasswordForm({ action }: { action: (previous: SetPasswordState, formData: FormData) => Promise<SetPasswordState> }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form className="form-stack" action={formAction} noValidate>
      {state.error && (
        <Alert role="alert" data-color="danger" data-size="sm">
          {t(state.error)}
        </Alert>
      )}
      <Field>
        <Label htmlFor="password">{t("setPassword.password")}</Label>
        <Field.Description>{t("setPassword.passwordHint")}</Field.Description>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          {...(state.fieldError ? { "aria-invalid": true as const, "aria-describedby": "password-error" } : {})}
        />
        {state.fieldError && <ValidationMessage id="password-error">{t(state.fieldError)}</ValidationMessage>}
      </Field>
      <Button type="submit" loading={pending} disabled={pending}>
        {t("setPassword.submit")}
      </Button>
    </form>
  );
}
