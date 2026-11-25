"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert, Button } from "@digdir/designsystemet-react";
import type { Status } from "@/modules/accounts";
import type { FormState } from "@/modules/shared/errors";
import { setClientStatusAction } from "./actions";

// Set inactive / Set active (FR-5). There is no delete action for a client (S10).
export function StatusForm({ clientId, status }: { clientId: string; status: Status }) {
  const t = useTranslations("clients");
  const tRoot = useTranslations();
  const [state, formAction, pending] = useActionState<FormState, FormData>(setClientStatusAction, {});
  const next: Status = status === "active" ? "inactive" : "active";
  return (
    <form action={formAction}>
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="status" value={next} />
      <Button type="submit" variant="tertiary" data-size="sm" loading={pending} disabled={pending}>
        {next === "inactive" ? t("setInactive") : t("setActive")}
      </Button>
      {state.error && (
        <Alert role="alert" data-color="danger" data-size="sm">
          {tRoot(state.error)}
        </Alert>
      )}
    </form>
  );
}
