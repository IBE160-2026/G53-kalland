"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Tag } from "@digdir/designsystemet-react";

export type FileRowState = "uploading" | "ready" | "failed" | "rejected";

export type FileRowData = {
  key: string;
  filename: string;
  state: FileRowState;
  title?: string | null;
  thumbnailUrl?: string | null;
  // A key in messages/en.json; rejection messages take the file name as {name}.
  messageKey?: string;
};

const TAG_COLOR = { uploading: "info", ready: "success", failed: "danger", rejected: "warning" } as const;

// A file row (UX-DR-28, first cut): 52 px thumb, title or file name, sub-line, message line and status
// tag. A stored file (Ready or Failed) shows its title, or "Untitled image", over the file name. Every
// text is rendered as escaped React text: file names, embedded titles and AI output are untrusted.
export function FileRow({ row }: { row: FileRowData }) {
  const t = useTranslations();
  const stored = row.state === "ready" || row.state === "failed";
  const primary = stored ? (row.title ?? t("upload.untitled")) : row.filename;
  const sub = stored ? row.filename : row.state === "rejected" ? t("upload.notAdded") : null;
  return (
    <li className="file-row" data-state={row.state}>
      <span className="file-row-thumb">
        {row.thumbnailUrl && <Image src={row.thumbnailUrl} alt="" width={52} height={52} unoptimized />}
      </span>
      <span className="file-row-text">
        <span className="file-row-title">{primary}</span>
        {sub && <span className="file-row-meta">{sub}</span>}
        {row.messageKey && <span className="file-row-message">{t(row.messageKey, { name: row.filename })}</span>}
      </span>
      <Tag className="file-row-tag" data-color={TAG_COLOR[row.state]} data-size="sm">
        {t(`upload.tag.${row.state}`)}
      </Tag>
    </li>
  );
}
