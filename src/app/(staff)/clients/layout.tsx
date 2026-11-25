import { Link } from "@digdir/designsystemet-react";
import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { ContextSidebar } from "@/app/_components/shell/sidebar";
import { EmptyState } from "@/app/_components/shell/shell";
import { listClientsForStaff } from "@/modules/accounts";
import { requireStaff } from "@/modules/auth";
import { ClientList } from "./client-list";

// The Clients tab (UX-DR-8): the client list in the context sidebar, next to the page for the open client.
// The guard here only reads the list; every Clients page and action still calls requireStaff() first.
export default async function ClientsLayout({ children }: LayoutProps<"/clients">) {
  const actor = await requireStaff();
  const t = await getTranslations("clients");
  const clients = await listClientsForStaff(actor);
  const add = (
    <Link asChild>
      <NextLink href="/clients/new">{t("add")}</NextLink>
    </Link>
  );

  return (
    <>
      <ContextSidebar label={t("list")} toggleLabel={t("listToggle")}>
        <div className="sidebar-head">
          <h2 className="sidebar-heading">{t("title")}</h2>
          {clients.length > 0 && add}
        </div>
        {clients.length === 0 ? <EmptyState text={t("empty")} action={add} /> : <ClientList clients={clients} />}
      </ContextSidebar>
      {children}
    </>
  );
}
