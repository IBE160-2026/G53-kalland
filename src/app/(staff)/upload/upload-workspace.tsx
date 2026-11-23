"use client";

import { useEffect, useEffectEvent, useRef, useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Button, EXPERIMENTAL_FileUpload as FileUpload } from "@digdir/designsystemet-react";
import type { UploadRow } from "@/modules/images";
import { startUpload, type StartUploadResult } from "./actions";
import { FileRow, type FileRowData } from "./file-row";

// The server refuses larger files too; checking here first spares sending them.
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png";
// The most rows one Server Action call creates; larger selections go in groups.
const GROUP_SIZE = 500;

type UploadResponse =
  | { status: "ready"; title: string | null; thumbnailUrl: string }
  | { status: "rejected"; reason: string }
  | { error?: string };

// A stored row still `uploading` after a reload has lost its file: nothing will send it any more.
function fromStored(row: UploadRow): FileRowData {
  if (row.processingState === "uploading") {
    return { key: row.id, filename: row.filename, state: "rejected", messageKey: "upload.rejected.connectionLost" };
  }
  return { key: row.id, filename: row.filename, state: "ready", title: row.title, thumbnailUrl: row.thumbnailUrl };
}

// Sends one file as the raw body of a PUT to the upload Route Handler, and turns the answer into the
// row's new state. A request that never gets an answer is a lost connection.
async function sendFile(imageId: string, file: File): Promise<Partial<FileRowData>> {
  let body: UploadResponse | null;
  try {
    const response = await fetch(`/api/images/${imageId}/file`, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": "application/octet-stream" },
    });
    body = await response.json().catch(() => null);
  } catch {
    return { state: "rejected", messageKey: "upload.rejected.connectionLost" };
  }
  if (body && "status" in body && body.status === "ready") {
    return { state: "ready", title: body.title, thumbnailUrl: body.thumbnailUrl };
  }
  if (body && "status" in body && body.status === "rejected") {
    return { state: "rejected", messageKey: `upload.rejected.${body.reason}` };
  }
  return { state: "rejected", messageKey: (body && "error" in body && body.error) || "errors.unexpected" };
}

// Upload (UX-DR-26/27, first cut): "New batch" opens the drop zone. Each added file shows a row at once;
// the rows are created on the server first (Server Action), then the files upload one at a time.
export function UploadWorkspace({ batch }: { batch: { batchId: string; rows: UploadRow[] } | null }) {
  const t = useTranslations("upload");
  const [started, setStarted] = useState(batch !== null);
  const [rows, setRows] = useState<FileRowData[]>(() => batch?.rows.map(fromStored) ?? []);
  const [sending, setSending] = useState(0);
  const [dragging, setDragging] = useState(false);
  const batchId = useRef(batch?.batchId);
  // Additions run one after another, so two quick drops never create two batches.
  const additions = useRef<Promise<void>>(Promise.resolve());
  const queue = useRef<{ key: string; imageId: string; file: File }[]>([]);
  const pumping = useRef(false);
  // Row keys for files added in this page. Not crypto.randomUUID(): that needs a secure context.
  const nextKey = useRef(0);

  function update(key: string, change: Partial<FileRowData>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...change } : row)));
  }

  async function pump() {
    if (pumping.current) return;
    pumping.current = true;
    for (let next = queue.current.shift(); next; next = queue.current.shift()) {
      update(next.key, await sendFile(next.imageId, next.file));
      setSending((count) => count - 1);
    }
    pumping.current = false;
  }

  async function add(files: File[]) {
    const entries = files.map((file) => ({ key: `added-${nextKey.current++}`, file, tooLarge: file.size > MAX_FILE_BYTES }));
    setRows((current) => [
      ...current,
      ...entries.map(({ key, file, tooLarge }): FileRowData => ({
        key,
        filename: file.name,
        state: tooLarge ? "rejected" : "uploading",
        messageKey: tooLarge ? "upload.rejected.tooLarge" : undefined,
      })),
    ]);
    const toSend = entries.filter((entry) => !entry.tooLarge);
    if (toSend.length === 0) return;

    const result = await startUpload({ batchId: batchId.current, filenames: toSend.map((entry) => entry.file.name) }).catch(
      (): StartUploadResult => ({ ok: false, error: "upload.rejected.connectionLost" }),
    );
    if (!result.ok) {
      for (const entry of toSend) update(entry.key, { state: "rejected", messageKey: result.error });
      return;
    }
    if (batchId.current !== result.batchId) {
      batchId.current = result.batchId;
      window.history.replaceState(null, "", `/upload?batch=${result.batchId}`);
    }
    toSend.forEach((entry, i) => queue.current.push({ key: entry.key, imageId: result.images[i].id, file: entry.file }));
    setSending((count) => count + toSend.length);
    void pump();
  }

  function addFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    for (let start = 0; start < files.length; start += GROUP_SIZE) {
      const group = files.slice(start, start + GROUP_SIZE);
      additions.current = additions.current.then(() => add(group));
    }
  }

  function onChoose(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files);
    // Lets the same file be chosen again.
    event.target.value = "";
  }

  // Once the batch has files, the whole page accepts dropped files (UX-DR-27).
  const hasRows = rows.length > 0;
  const onPageDrop = useEffectEvent((files: FileList | null) => addFiles(files));
  useEffect(() => {
    if (!hasRows) return;
    const isFileDrag = (event: DragEvent) => event.dataTransfer?.types.includes("Files") ?? false;
    const over = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      setDragging(true);
    };
    const leave = (event: DragEvent) => {
      if (event.relatedTarget === null) setDragging(false);
    };
    const drop = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      setDragging(false);
      onPageDrop(event.dataTransfer?.files ?? null);
    };
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [hasRows]);

  if (!started) {
    return (
      <div className="empty-state">
        <p>{t("start")}</p>
        <Button onClick={() => setStarted(true)}>{t("newBatch")}</Button>
      </div>
    );
  }

  return (
    <div className="upload-workspace">
      {hasRows ? (
        <div className="drop-bar" data-dragging={dragging || undefined}>
          <Button asChild variant="secondary" data-size="sm">
            <label>
              {t("addMore")}
              <input type="file" className="visually-hidden" multiple accept={ACCEPT} onChange={onChoose} />
            </label>
          </Button>
          <span className="muted">{t("dropAnywhere")}</span>
        </div>
      ) : (
        // The native file input covers the whole zone (Designsystemet CSS), so a dropped file reaches
        // `onChange`. No drop handler here: one would add every dropped file a second time.
        <FileUpload className="drop-zone">
          <p id="drop-zone-text">{t("dropZone")}</p>
          <Button asChild variant="secondary">
            <span>{t("chooseFiles")}</span>
          </Button>
          <input
            type="file"
            multiple
            accept={ACCEPT}
            aria-label={t("chooseFiles")}
            aria-describedby="drop-zone-text"
            onChange={onChoose}
          />
        </FileUpload>
      )}
      {sending > 0 && <p className="upload-keep-open">{t("keepOpen")}</p>}
      {/* Always present, so screen readers announce rows as they are added and change state. */}
      <ul className="file-list" aria-label={t("files")} aria-live="polite" hidden={!hasRows}>
        {rows.map((row) => (
          <FileRow key={row.key} row={row} />
        ))}
      </ul>
    </div>
  );
}
