"use client";

import { useActionState, useId, useState } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Alert, Button, Field, Input, Label, Link, Select, Textarea, ValidationMessage } from "@digdir/designsystemet-react";
import type { ClientField, ClientInput } from "@/modules/accounts";
import type { ClientFormState } from "./actions";

// The one form for Add client and Edit client (FR-1). Each field shows its own inline error; the fields
// are controlled, so a refused save keeps every value entered. Add client carries a nonce (idempotency).
export function ClientForm({
  action,
  initial,
  staff,
  nonce,
  cancelHref,
}: {
  action: (previous: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  initial: ClientInput;
  staff: { id: string; name: string }[];
  nonce?: string;
  cancelHref: string;
}) {
  const t = useTranslations("clients.form");
  const tRoot = useTranslations();
  const id = useId();
  const [state, formAction, pending] = useActionState(action, {});
  const [values, setValues] = useState(initial);
  const errors: Partial<Record<ClientField, string>> = state.fieldErrors ?? {};

  function set(field: keyof ClientInput) {
    return (event: { target: { value: string } }) => setValues((current) => ({ ...current, [field]: event.target.value }));
  }

  // Ids for the inputs and, when a field has an error, its message.
  const ids = (field: keyof ClientInput) => ({ input: `${id}-${field}`, error: `${id}-${field}-error` });

  function errorProps(field: ClientField) {
    return errors[field] ? { "aria-invalid": true as const, "aria-describedby": ids(field).error } : {};
  }

  function error(field: ClientField) {
    const message = errors[field];
    return message ? <ValidationMessage id={ids(field).error}>{tRoot(message)}</ValidationMessage> : null;
  }

  function textField(field: "name" | "billingEmail", label: string, props: { type?: "email"; autoComplete?: string } = {}) {
    return (
      <Field>
        <Label htmlFor={ids(field).input}>{label}</Label>
        <Input id={ids(field).input} name={field} value={values[field]} onChange={set(field)} {...props} {...errorProps(field)} />
        {error(field)}
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
      {nonce && <input type="hidden" name="nonce" value={nonce} />}
      {textField("name", t("name"), { autoComplete: "organization" })}
      <Field>
        <Label htmlFor={ids("orgNumber").input}>{t("orgNumber")}</Label>
        <Field.Description>{t("orgNumberHint")}</Field.Description>
        <Input
          id={ids("orgNumber").input}
          name="orgNumber"
          inputMode="numeric"
          value={values.orgNumber}
          onChange={set("orgNumber")}
          {...errorProps("orgNumber")}
        />
        {error("orgNumber")}
      </Field>
      {textField("billingEmail", t("billingEmail"), { type: "email", autoComplete: "email" })}
      <Field>
        <Label htmlFor={ids("accountManagerId").input}>{t("accountManager")}</Label>
        <Select
          id={ids("accountManagerId").input}
          name="accountManagerId"
          value={values.accountManagerId}
          onChange={set("accountManagerId")}
          width="auto"
          {...errorProps("accountManagerId")}
        >
          <Select.Option value="">{t("chooseAccountManager")}</Select.Option>
          {staff.map((user) => (
            <Select.Option key={user.id} value={user.id}>
              {user.name}
            </Select.Option>
          ))}
        </Select>
        {error("accountManagerId")}
      </Field>
      <Field>
        <Label htmlFor={ids("staffNotes").input}>{t("staffNotes")}</Label>
        <Field.Description>{tRoot("clients.staffOnly")}</Field.Description>
        <Textarea id={ids("staffNotes").input} name="staffNotes" rows={4} value={values.staffNotes} onChange={set("staffNotes")} />
      </Field>
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
