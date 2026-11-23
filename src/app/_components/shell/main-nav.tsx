"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Text tabs; the current one gets aria-current="page" and the accent underline (UX-DR-7).
export function MainNav({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="main-nav" aria-label={label}>
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
