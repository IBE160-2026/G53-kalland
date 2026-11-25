import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { PageMain } from "@/app/_components/shell/shell";
import { requireStaff } from "@/modules/auth";
import { createContactAction } from "../../../contact-actions";
import { ContactForm } from "../../../contact-form";
import { loadClient } from "../../../load-client";

// Add contact (FR-2), also for an inactive client. Save and Cancel return to the client.
export default async function NewContactPage({ params }: PageProps<"/clients/[id]/contacts/new">) {
  const actor = await requireStaff();
  const client = await loadClient(actor, (await params).id);
  const t = await getTranslations("contacts.form");

  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("addTitle", { client: client.name })}
      </Heading>
      <ContactForm
        action={createContactAction.bind(null, client.id)}
        initial={{ name: "", email: "", phone: "" }}
        cancelHref={`/clients/${client.id}`}
      />
    </PageMain>
  );
}
