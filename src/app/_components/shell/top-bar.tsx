import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getClient, getUser } from "@/modules/accounts";
import type { Actor } from "@/modules/auth";
import { AccountMenu } from "./account-menu";
import { HeaderSearch } from "./header-search";
import { MainNav } from "./main-nav";
import { landingPath, searchTarget, tabs, type Surface } from "./nav";
import { SidebarToggle } from "./sidebar";

// Display only: the layout passes the Actor its guard returned; pages still run their own guard (AD-5).
export async function TopBar({ actor }: { actor: Actor }) {
  const surface: Surface = actor.role === "staff" ? "staff" : "client";
  const [user, client, t] = await Promise.all([
    getUser(actor.userId),
    actor.role === "contact" ? getClient(actor.clientId) : null,
    getTranslations(),
  ]);
  const firstName = user.name.split(/\s+/)[0];

  return (
    <header className="top-bar">
      <SidebarToggle />
      {client ? (
        <Link className="wordmark client-name" href={landingPath.client}>
          <span>{client.name}</span>
          <small>{t("shell.imagePortal")}</small>
        </Link>
      ) : (
        <Link className="wordmark" href={landingPath.staff}>
          <span className="wordmark-mark" aria-hidden="true" />
          {t("app.name")}
        </Link>
      )}
      <MainNav
        label={t("shell.mainNav")}
        items={tabs[surface].map((tab) => ({ href: tab.href, label: t(`nav.${tab.labelKey}`) }))}
      />
      <HeaderSearch action={searchTarget[surface]} label={t(`search.${surface}`)} />
      <div className="top-bar-end">
        <AccountMenu firstName={firstName} logoutLabel={t("session.logout")} />
      </div>
    </header>
  );
}
