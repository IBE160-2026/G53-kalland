"use client";

import { useActionState, useId, useState } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Alert, Button, Field, Input, Label, Link, ValidationMessage } from "@digdir/designsystemet-react";
import type { ContactField, ContactInput } from "@/modules/accounts";
import type { ContactFormState } from "./contact-actions";

// The one form for Add contact and Edit contact (FR-2). Each field shows its own inline error; the fields
// are controlled, so a refused save keeps every value entered.
export function ContactForm({
  action,
  initial,
  cancelHref,
}: {
  action: (previous: ContactFormState, formData: FormData) => Promise<ContactFormState>;
  initial: ContactInput;
  cancelHref: string;
}) {
  const t = useTranslations("contacts.form");
  const tRoot = useTranslations();
  const id = useId();
  const [state, formAction, pending] = useActionState(action, {});
  const [values, setValues] = useState(initial);
  const errors: Partial<Record<ContactField, string>> = state.fieldErrors ?? {};

  function field(
    name: ContactField,
    label: string,
    props: { type?: "email" | "tel"; autoComplete?: string; description?: string } = {},
  ) {
    const { description, ...inputProps } = props;
    const inputId = `${id}-${name}`;
    const errorId = `${inputId}-error`;
    const message = errors[name];
    return (
      <Field>
        <Label htmlFor={inputId}>{label}</Label>
        {description && <Field.Description>{description}</Field.Description>}
        <Input
          id={inputId}
          name={name}
          value={values[name]}
          onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
          {...inputProps}
          {...(message ? { "aria-invalid": true as const, "aria-describedby": errorId } : {})}
        />
        {message && <ValidationMessage id={errorId}>{tRoot(message)}</ValidationMessage>}
      </Field>
    );
  }

  return (
    <form className="form-stack client-form" action={formAction} noValidate>
      {state.error && (
        <Alert role="alert" data-color="danger" data-size="sm">
          {tRoot(state.error)}
        </Alert>
      )}
      {field("name", t("name"), { autoComplete: "name" })}
      {field("email", t("email"), { type: "email", autoComplete: "email", description: t("emailHint") })}
      {field("phone", t("phone"), { type: "tel", autoComplete: "tel", description: t("phoneHint") })}
      <div className="form-actions">
        <Button type="submit" loading={pending} disabled={pending}>
          {t("save")}
        </Button>
        <Link asChild>
          <NextLink href={cancelHref}>{t("cancel")}</NextLink>
        </Link>
      </div>
    </form>
  );
}
