import type { ReactNode } from "react";
import { Tag } from "@digdir/designsystemet-react";

// Status tag colours (UX-DR-14): Neutral (Draft, Queued, Archived), Info (Uploading), Accent (In progress),
// Success (Ready, Published), Danger (Failed), Warning (Rejected). Always text-labelled. Clients: Active
// (Success) and Inactive (Neutral).
const TAG_COLOR = {
  draft: "neutral",
  queued: "neutral",
  archived: "neutral",
  uploading: "info",
  generating: "accent",
  ready: "success",
  published: "success",
  failed: "danger",
  rejected: "warning",
  active: "success",
  inactive: "neutral",
} as const;

export type TagState = keyof typeof TAG_COLOR;

export function StatusTag({ state, className, children }: { state: TagState; className?: string; children: ReactNode }) {
  return (
    <Tag className={className} data-color={TAG_COLOR[state]} data-size="sm">
      {children}
    </Tag>
  );
}
