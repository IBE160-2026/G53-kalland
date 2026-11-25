"use client";

import { useActionState, useId, useState } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Alert, Button, Field, Heading, Input, Label, Link, ValidationMessage } from "@digdir/designsystemet-react";
import type { ContactField, ContactInput } from "@/modules/accounts";
import type { ContactFormState } from "./contact-actions";
import { SetupLinkPanel } from "./setup-link-panel";

// The one form for Add contact and Edit contact (FR-2). Each field shows its own inline error; the fields
// are controlled, so a refused save keeps every value entered. After Add contact the form gives way to
// "Contact added" with the new setup link (FR-4) and a link back to the client; Edit redirects instead.
export function ContactForm({
  action,
  initial,
  cancelHref,
  clientName,
}: {
  action: (previous: ContactFormState, formData: FormData) => Promise<ContactFormState>;
  initial: ContactInput;
  cancelHref: string;
  clientName: string;
}) {
  const t = useTranslations("contacts.form");
  const tRoot = useTranslations();
  const id = useId();
  const [state, formAction, pending] = useActionState(action, {});
  const [values, setValues] = useState(initial);
  const errors: Partial<Record<ContactField, string>> = state.fieldErrors ?? {};
  const tContacts = useTranslations("contacts");

  if (state.created) {
    return (
      <div className="form-stack client-form">
        <Alert data-color="success" data-size="sm">
          <Heading level={2} data-size="xs">
            {tContacts("added")}
          </Heading>
          <p>{tContacts("addedText", { name: state.created.name })}</p>
        </Alert>
        <SetupLinkPanel name={state.created.name} link={state.created.link} />
        <Link asChild>
          <NextLink href={cancelHref}>{tContacts("backTo", { client: clientName })}</NextLink>
        </Link>
      </div>
    );
  }

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
