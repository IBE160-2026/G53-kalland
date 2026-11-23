// Inline SVG icons copied from the mockup's symbols (i-panel, i-close), plus the own-image check.
export function PanelIcon({ className }: { className?: string }) {
  return (
    <svg className={`icon ${className ?? ""}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={`icon ${className ?? ""}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

// The own-image tick's check (UX-DR-15). Decorative: the caption says "Yours to download".
export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={`icon ${className ?? ""}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5.5 12.5l4.5 4.5 8.5-9" />
    </svg>
  );
}
