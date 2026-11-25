import { Heading } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { PageMain } from "@/app/_components/shell/shell";
import { requireStaff } from "@/modules/auth";
import { updateContactAction } from "../../../../contact-actions";
import { ContactForm } from "../../../../contact-form";
import { loadClient, loadContact } from "../../../../load-client";

// Edit contact (FR-2): the same form as Add contact, filled in. Not found unless the contact belongs to
// the client in the URL.
export default async function EditContactPage({ params }: PageProps<"/clients/[id]/contacts/[contactId]/edit">) {
  const actor = await requireStaff();
  const { id, contactId } = await params;
  const client = await loadClient(actor, id);
  const contact = await loadContact(actor, client, contactId);
  const t = await getTranslations("contacts.form");

  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("editTitle", { name: contact.name })}
      </Heading>
      <ContactForm
        action={updateContactAction.bind(null, client.id, contact.id)}
        initial={{ name: contact.name, email: contact.email, phone: contact.phone ?? "" }}
        cancelHref={`/clients/${client.id}`}
        clientName={client.name}
      />
    </PageMain>
  );
}
