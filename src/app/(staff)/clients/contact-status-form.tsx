"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert, Button } from "@digdir/designsystemet-react";
import type { Status } from "@/modules/accounts";
import type { FormState } from "@/modules/shared/errors";
import { setContactStatusAction } from "./contact-actions";

// Deactivate / Reactivate a contact (FR-5), without a confirm step: it is reversible. There is no delete.
export function ContactStatusForm({ contactId, name, status }: { contactId: string; name: string; status: Status }) {
  const t = useTranslations("contacts");
  const tRoot = useTranslations();
  const [state, formAction, pending] = useActionState<FormState, FormData>(setContactStatusAction, {});
  const next: Status = status === "active" ? "inactive" : "active";
  return (
    <form action={formAction} className="contact-status-form">
      <input type="hidden" name="contactId" value={contactId} />
      <input type="hidden" name="status" value={next} />
      <Button
        type="submit"
        variant="tertiary"
        data-size="sm"
        loading={pending}
        disabled={pending}
        aria-label={next === "inactive" ? t("deactivateLabel", { name }) : t("reactivateLabel", { name })}
      >
        {next === "inactive" ? t("deactivate") : t("reactivate")}
      </Button>
      {state.error && (
        <Alert role="alert" data-color="danger" data-size="sm">
          {tRoot(state.error)}
        </Alert>
      )}
    </form>
  );
}
