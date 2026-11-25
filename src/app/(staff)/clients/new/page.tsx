import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { PageMain } from "@/app/_components/shell/shell";
import { listActiveStaff } from "@/modules/accounts";
import { requireStaff } from "@/modules/auth";
import { createClientAction } from "../actions";
import { ClientForm } from "../client-form";

// Add client (FR-1). The nonce is new on every load of this page, so a double submit creates one client.
export default async function NewClientPage() {
  const actor = await requireStaff();
  const t = await getTranslations("clients.form");
  const staff = await listActiveStaff();
  const accountManagerId = staff.some((user) => user.id === actor.userId) ? actor.userId : "";

  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("addTitle")}
      </Heading>
      <ClientForm
        action={createClientAction}
        initial={{ name: "", orgNumber: "", billingEmail: "", accountManagerId, staffNotes: "" }}
        staff={staff}
        nonce={crypto.randomUUID()}
        cancelHref="/clients"
      />
    </PageMain>
  );
}
