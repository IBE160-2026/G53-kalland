import type { ReactNode } from "react";
import { SkipLink } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import type { Actor } from "@/modules/auth";
import { SidebarProvider } from "./sidebar";
import { TopBar } from "./top-bar";

// The frame both route-group layouts share: skip link, top bar, and a workspace for the page's
// optional <ContextSidebar> and its <PageMain>.
export async function Shell({ actor, children }: { actor: Actor; children: ReactNode }) {
  const t = await getTranslations("shell");
  return (
    <SidebarProvider>
      <SkipLink href="#main">{t("skipToContent")}</SkipLink>
      <TopBar actor={actor} />
      <div className="workspace">{children}</div>
    </SidebarProvider>
  );
}

export function PageMain({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="page-main" tabIndex={-1}>
      {children}
    </main>
  );
}

// One muted sentence where the list would be, plus at most one action (UX-DR-47).
export function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <p>{text}</p>
      {action}
    </div>
  );
}
