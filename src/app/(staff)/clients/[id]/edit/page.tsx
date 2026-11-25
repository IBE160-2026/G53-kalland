import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { PageMain } from "@/app/_components/shell/shell";
import { listActiveStaff } from "@/modules/accounts";
import { requireStaff } from "@/modules/auth";
import { updateClientAction } from "../../actions";
import { ClientForm } from "../../client-form";
import { loadClient } from "../../load-client";

// Edit client (FR-1): the same form as Add client, filled in.
export default async function EditClientPage({ params }: PageProps<"/clients/[id]/edit">) {
  const actor = await requireStaff();
  const client = await loadClient(actor, (await params).id);
  const t = await getTranslations("clients.form");
  const staff = await listActiveStaff();

  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("editTitle", { name: client.name })}
      </Heading>
      <ClientForm
        action={updateClientAction.bind(null, client.id)}
        initial={{
          name: client.name,
          orgNumber: client.orgNumber ?? "",
          billingEmail: client.billingEmail ?? "",
          accountManagerId: client.accountManagerId ?? "",
          staffNotes: client.staffNotes,
        }}
        staff={staff}
        cancelHref={`/clients/${client.id}`}
      />
    </PageMain>
  );
}
