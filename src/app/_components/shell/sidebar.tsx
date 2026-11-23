"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { Button } from "@digdir/designsystemet-react";
import { CloseIcon, PanelIcon } from "./icons";

// The Context sidebar (UX-DR-8): a column above 900 px, an overlay drawer at 900 px and below.
// The layout renders the provider; a page that has a sidebar renders <ContextSidebar>, which registers
// itself, and only then does the top bar show the toggle.
const DRAWER_QUERY = "(max-width: 900px)";

type SidebarContext = {
  sidebarId: string;
  toggleLabel: string | null;
  register: (toggleLabel: string) => () => void;
  columnOpen: boolean;
  drawerOpen: boolean;
  narrow: boolean;
  toggle: () => void;
  closeDrawer: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
};

const Context = createContext<SidebarContext | null>(null);

function useSidebar(): SidebarContext {
  const context = useContext(Context);
  if (!context) throw new Error("Sidebar components must be inside <SidebarProvider>.");
  return context;
}

function subscribeNarrow(onChange: () => void): () => void {
  const query = window.matchMedia(DRAWER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const sidebarId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [toggleLabel, setToggleLabel] = useState<string | null>(null);
  const [columnOpen, setColumnOpen] = useState(true);
  const [drawerState, setDrawerState] = useState(false);
  // The server renders the wide layout; CSS hides the column at 900 px and below until hydration.
  const narrow = useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(DRAWER_QUERY).matches,
    () => false,
  );
  const drawerOpen = narrow && drawerState;

  // A drawer left open when the window grows past 900 px is closed, so it does not reopen on shrinking.
  useEffect(() => {
    const query = window.matchMedia(DRAWER_QUERY);
    const onChange = () => setDrawerState(false);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const register = useCallback((label: string) => {
    setToggleLabel(label);
    // Leaving a page with a sidebar also closes its drawer, so no scroll lock or Escape handler outlives it.
    return () => {
      setToggleLabel(null);
      setDrawerState(false);
    };
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerState(false);
    toggleRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    if (narrow) setDrawerState((open) => !open);
    else setColumnOpen((open) => !open);
  }, [narrow]);

  // Page scroll is locked while the drawer is open; Escape closes it.
  useEffect(() => {
    if (!drawerOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault();
        closeDrawer();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  const value = useMemo(
    () => ({ sidebarId, toggleLabel, register, columnOpen, drawerOpen, narrow, toggle, closeDrawer, toggleRef }),
    [sidebarId, toggleLabel, register, columnOpen, drawerOpen, narrow, toggle, closeDrawer],
  );

  return (
    <Context.Provider value={value}>
      <div className="app" data-sidebar={columnOpen ? "open" : "closed"} data-drawer={drawerOpen ? "open" : undefined}>
        {children}
      </div>
    </Context.Provider>
  );
}

// Tertiary icon button in the top bar. While the drawer is open it shows × and sits above the drawer.
export function SidebarToggle() {
  const { sidebarId, toggleLabel, columnOpen, drawerOpen, narrow, toggle, toggleRef } = useSidebar();
  if (!toggleLabel) return null;
  return (
    <Button
      ref={toggleRef}
      className="sidebar-toggle"
      variant="tertiary"
      icon
      aria-label={toggleLabel}
      aria-expanded={narrow ? drawerOpen : columnOpen}
      aria-controls={sidebarId}
      onClick={toggle}
    >
      {drawerOpen ? <CloseIcon /> : <PanelIcon />}
    </Button>
  );
}

export function ContextSidebar({ label, toggleLabel, children }: { label: string; toggleLabel: string; children: ReactNode }) {
  const { sidebarId, register, drawerOpen, closeDrawer, toggleRef } = useSidebar();
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => register(toggleLabel), [register, toggleLabel]);

  // Focus moves into the drawer, below the toggle that stays on top of it.
  useEffect(() => {
    const aside = asideRef.current;
    if (!drawerOpen || !aside) return;
    const toggleBottom = toggleRef.current?.getBoundingClientRect().bottom ?? 0;
    aside.style.setProperty("--drawer-pad", `${Math.round(toggleBottom + 20)}px`);
    aside.focus();
  }, [drawerOpen, toggleRef]);

  return (
    <>
      {drawerOpen && <div className="sidebar-scrim" aria-hidden="true" onClick={closeDrawer} />}
      <aside ref={asideRef} id={sidebarId} className="context-sidebar" aria-label={label} tabIndex={-1}>
        {children}
      </aside>
    </>
  );
}
