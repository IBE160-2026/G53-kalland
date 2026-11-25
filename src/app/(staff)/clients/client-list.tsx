"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { StatusTag } from "@/app/_components/status-tag";
import type { ClientListItem } from "@/modules/accounts";

// The client list in the Clients sidebar (UX-DR-8): links, newest first; the open client is marked
// with aria-current, so a reload keeps the selection.
export function ClientList({ clients }: { clients: ClientListItem[] }) {
  const t = useTranslations("clients");
  const pathname = usePathname();
  return (
    <ul className="client-list">
      {clients.map((client) => {
        const href = `/clients/${client.id}`;
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={client.id}>
            <NextLink href={href} aria-current={current ? "true" : undefined}>
              <span className="client-list-text">
                <span className="client-list-name">{client.name}</span>
                <small>{t("contactCount", { n: client.contactCount })}</small>
              </span>
              {client.status === "inactive" && <StatusTag state="inactive">{t("status.inactive")}</StatusTag>}
            </NextLink>
          </li>
        );
      })}
    </ul>
  );
}
