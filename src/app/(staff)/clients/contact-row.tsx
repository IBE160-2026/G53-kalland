"use client";

import { useActionState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Alert, Button } from "@digdir/designsystemet-react";
import { newSetupLinkAction, type SetupLinkState } from "./contact-actions";
import { SetupLinkPanel } from "./setup-link-panel";

// One contact row with its "New setup link" action (FR-4): the new link's panel opens under the row.
// `who` and `actions` are the row's server-rendered name and other actions.
export function ContactRow({
  contactId,
  name,
  who,
  actions,
}: {
  contactId: string;
  name: string;
  who: ReactNode;
  actions: ReactNode;
}) {
  const t = useTranslations("contacts");
  const tRoot = useTranslations();
  const [state, formAction, pending] = useActionState<SetupLinkState, FormData>(newSetupLinkAction, {});

  return (
    <li className="contact-row">
      {who}
      <span className="contact-end">
        {actions}
        <form action={formAction} className="contact-status-form">
          <input type="hidden" name="contactId" value={contactId} />
          <Button
            type="submit"
            variant="tertiary"
            data-size="sm"
            loading={pending}
            disabled={pending}
            aria-label={t("newSetupLinkLabel", { name })}
          >
            {t("newSetupLink")}
          </Button>
        </form>
      </span>
      {state.error && (
        <Alert role="alert" data-color="danger" data-size="sm" className="contact-row-full">
          {tRoot(state.error)}
        </Alert>
      )}
      {state.link && (
        <div className="contact-row-full">
          <SetupLinkPanel key={state.link.url} name={name} link={state.link} />
        </div>
      )}
    </li>
  );
}
