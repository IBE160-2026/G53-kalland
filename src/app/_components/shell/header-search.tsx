"use client";

import { Search } from "@digdir/designsystemet-react";

// Header search: a plain GET to its surface (`/library?q=…`, `/find-images?q=…`). Results come in 1.4 and 1.8.
export function HeaderSearch({ action, label }: { action: string; label: string }) {
  return (
    <form className="header-search" role="search" action={action} method="get">
      <Search data-size="sm">
        <Search.Input name="q" aria-label={label} placeholder={label} />
        <Search.Clear />
      </Search>
    </form>
  );
}
