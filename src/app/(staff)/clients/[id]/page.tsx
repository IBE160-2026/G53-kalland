import { Button, Heading, Link } from "@digdir/designsystemet-react";
import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState, PageMain } from "@/app/_components/shell/shell";
import { StatusTag } from "@/app/_components/status-tag";
import { listContactsForStaff } from "@/modules/accounts";
import { requireStaff } from "@/modules/auth";
import { ContactStatusForm } from "../contact-status-form";
import { loadClient } from "../load-client";
import { ContactRow } from "../contact-row";
import { StatusForm } from "../status-form";

// Shows an org number in the usual groups of three: 921 456 786.
function formatOrgNumber(value: string): string {
  return value.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3");
}

// A client's details and contacts for staff (FR-1, FR-2, FR-4, FR-5): Edit, Set inactive or Set active,
// Deactivate or Reactivate, New setup link, never delete (S10). Staff notes and the account manager appear only here.
export default async function ClientPage({ params }: PageProps<"/clients/[id]">) {
  const actor = await requireStaff();
  const client = await loadClient(actor, (await params).id);
  const t = await getTranslations("clients");
  const tContacts = await getTranslations("contacts");
  const contacts = await listContactsForStaff(actor, client.id);
  const addHref = `/clients/${client.id}/contacts/new`;

  return (
    <PageMain>
      <div className="client-head">
        <div className="client-title">
          <Heading level={1} className="page-title">
            {client.name}
          </Heading>
          <StatusTag state={client.status}>{t(`status.${client.status}`)}</StatusTag>
        </div>
        <div className="client-actions">
          <Button asChild variant="secondary" data-size="sm">
            <NextLink href={`/clients/${client.id}/edit`}>{t("edit")}</NextLink>
          </Button>
          <StatusForm key={client.status} clientId={client.id} status={client.status} />
        </div>
      </div>

      <section className="client-section" aria-labelledby="client-details">
        <h2 id="client-details" className="section-title">
          {t("details")}
        </h2>
        <dl className="key-values">
          <dt>{t("orgNumber")}</dt>
          <dd>{client.orgNumber ? formatOrgNumber(client.orgNumber) : t("none")}</dd>
          <dt>{t("billingEmail")}</dt>
          <dd>{client.billingEmail ?? t("none")}</dd>
          <dt>{t("accountManager")}</dt>
          <dd>{client.accountManagerName ?? t("none")}</dd>
          <dt>{t("statusLabel")}</dt>
          <dd>{t(`statusText.${client.status}`)}</dd>
        </dl>
        <div className="client-notes">
          <h3 className="section-title">{t("staffNotes")}</h3>
          <p className="muted">{t("staffOnly")}</p>
          <p className="client-notes-body">{client.staffNotes || t("none")}</p>
        </div>
      </section>

      <section className="client-section" aria-labelledby="client-contacts">
        <div className="section-head">
          <h2 id="client-contacts" className="section-title">
            {tContacts("title")}
          </h2>
          {contacts.length > 0 && (
            <Button asChild variant="secondary" data-size="sm">
              <NextLink href={addHref}>{tContacts("add")}</NextLink>
            </Button>
          )}
        </div>
        {contacts.length === 0 ? (
          <EmptyState
            text={tContacts("empty")}
            action={
              <Link asChild>
                <NextLink href={addHref}>{tContacts("add")}</NextLink>
              </Link>
            }
          />
        ) : (
          <ul className="contact-list">
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contactId={contact.id}
                name={contact.name}
                who={
                  <span className="contact-who">
                    <span className="contact-name">{contact.name}</span>
                    <span className="contact-details">
                      {contact.phone ? `${contact.email}, ${contact.phone}` : contact.email}
                    </span>
                  </span>
                }
                actions={
                  <>
                    <StatusTag state={contact.status}>{tContacts(`status.${contact.status}`)}</StatusTag>
                    <Button asChild variant="tertiary" data-size="sm">
                      <NextLink
                        href={`/clients/${client.id}/contacts/${contact.id}/edit`}
                        aria-label={tContacts("editLabel", { name: contact.name })}
                      >
                        {tContacts("edit")}
                      </NextLink>
                    </Button>
                    <ContactStatusForm
                      key={contact.status}
                      contactId={contact.id}
                      name={contact.name}
                      status={contact.status}
                    />
                  </>
                }
              />
            ))}
          </ul>
        )}
      </section>
    </PageMain>
  );
}
