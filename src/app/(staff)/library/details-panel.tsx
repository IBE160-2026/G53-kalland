"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert, Button } from "@digdir/designsystemet-react";
import { StatusTag } from "@/app/_components/status-tag";
import type { LibraryImage } from "@/modules/images";
import { AccessControls, type AccessValue } from "./access-controls";
import { publishImageAction, saveAccessAction } from "./actions";
import { PublishDialog } from "./publish-dialog";

const UNFINISHED: LibraryImage["processingState"][] = ["uploading", "queued", "generating"];

function sameClients(a: AccessValue["clients"], b: AccessValue["clients"]): boolean {
  const ids = new Set(a.map((client) => client.id));
  return a.length === b.length && b.every((client) => ids.has(client.id));
}

function changedFields(initial: AccessValue, current: AccessValue): number {
  return (
    Number(initial.visibility !== current.visibility) +
    Number(initial.priceTier !== current.priceTier) +
    Number(!sameClients(initial.clients, current.clients))
  );
}

// The Library Details panel (UX-DR-18, Library variant; UX-DR-20, first cut). View mode is read-only;
// Edit shows the access controls; Save changes sends the loaded version and the restricted list as a diff.
// A failed save keeps edit mode and the values. Metadata fields join edit mode with FR-17 (Story 3.4).
export function DetailsPanel({
  image,
  activeClients,
  paidPrice,
}: {
  image: LibraryImage;
  activeClients: { id: string; name: string }[];
  paidPrice: string | null;
}) {
  const t = useTranslations("library");
  const tRoot = useTranslations();
  const router = useRouter();
  const titleId = useId();
  const reasonId = useId();
  const editRef = useRef<HTMLButtonElement>(null);
  const visibilityRef = useRef<HTMLFieldSetElement>(null);
  const [edit, setEdit] = useState<{ initial: AccessValue; value: AccessValue } | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Where focus goes after the next render: Edit after Save changes or Cancel, Visibility after Edit.
  const focusTarget = useRef<"edit" | "visibility" | null>(null);
  const [pending, startTransition] = useTransition();

  // Focus moves once the panel has re-rendered and no action is pending.
  useEffect(() => {
    if (!focusTarget.current || pending) return;
    if (focusTarget.current === "edit") editRef.current?.focus();
    else visibilityRef.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    focusTarget.current = null;
  });

  const current: AccessValue = { visibility: image.visibility, priceTier: image.priceTier, clients: image.clients };
  const unfinished = UNFINISHED.includes(image.processingState);
  const canPublish = image.status === "draft";

  function startEdit() {
    setEdit({ initial: current, value: current });
    setSaved(false);
    setError(null);
    focusTarget.current = "visibility";
  }

  function cancelEdit() {
    setEdit(null);
    setError(null);
    focusTarget.current = "edit";
  }

  function save() {
    if (!edit) return;
    const initialIds = new Set(edit.initial.clients.map((client) => client.id));
    const valueIds = new Set(edit.value.clients.map((client) => client.id));
    startTransition(async () => {
      const result = await saveAccessAction({
        imageId: image.id,
        version: image.version,
        visibility: edit.value.visibility,
        priceTier: edit.value.priceTier,
        // Hidden chips are not sent: outside Restricted the module deletes the list.
        clients:
          edit.value.visibility === "restricted"
            ? {
                added: [...valueIds].filter((id) => !initialIds.has(id)),
                removed: [...initialIds].filter((id) => !valueIds.has(id)),
              }
            : { added: [], removed: [] },
      });
      if (result.error) {
        setError(result.error);
        // A stale version: load the current one, so trying again can succeed.
        if (result.error === "errors.saveFailed") router.refresh();
        return;
      }
      setEdit(null);
      setError(null);
      setSaved(true);
      focusTarget.current = "edit";
    });
  }

  function publish() {
    setDialogOpen(false);
    setSaved(false);
    startTransition(async () => {
      const result = await publishImageAction({ imageId: image.id });
      setError(result.error ?? null);
      if (!result.error) focusTarget.current = "edit";
    });
  }

  const changes = edit ? changedFields(edit.initial, edit.value) : 0;
  const visibilityLabel = t(`visibility.${image.visibility}`);
  const priceLabel = image.priceTier === "free" ? t("free") : paidPrice ? t("access.pricePerLicence", { price: paidPrice }) : t("paid");

  return (
    <section className="details-panel" aria-labelledby={titleId}>
      <header className="panel-header">
        <h2 id={titleId} className="panel-title">
          {image.title}
        </h2>
        <p className="panel-file">{image.filename}</p>
      </header>

      <div className="panel-loupe">
        {image.width !== null && image.height !== null && (
          <Image src={`/api/images/${image.id}/thumbnail`} alt={image.altText ?? ""} width={image.width} height={image.height} unoptimized />
        )}
      </div>

      <div className="panel-status">
        <StatusTag state={image.status}>{t(`tag.${image.status}`)}</StatusTag>
        {image.processingState !== "ready" && (
          <StatusTag state={image.processingState}>{t(`tag.${image.processingState}`)}</StatusTag>
        )}
        <span role="status" className="save-status" data-state={saved ? "saved" : undefined}>
          {saved ? t("panel.saved") : ""}
        </span>
      </div>

      {error && (
        <Alert data-color="danger" data-size="sm">
          {tRoot(error)}
        </Alert>
      )}

      <section className="panel-section">
        <h3 className="section-title">{t("panel.whoCanSeeIt")}</h3>
        {edit ? (
          <AccessControls
            value={edit.value}
            onChange={(value) => setEdit({ ...edit, value })}
            activeClients={activeClients}
            paidPrice={paidPrice}
            visibilityRef={visibilityRef}
          />
        ) : (
          <>
            <dl className="key-values">
              <dt>{t("access.visibility")}</dt>
              <dd>{visibilityLabel}</dd>
              {image.visibility === "restricted" && (
                <>
                  <dt>{t("access.clients")}</dt>
                  <dd>{image.clients.length > 0 ? image.clients.map((client) => client.name).join(", ") : t("panel.none")}</dd>
                </>
              )}
              <dt>{t("access.price")}</dt>
              <dd className={image.priceTier === "paid" ? "price" : undefined}>{priceLabel}</dd>
            </dl>
            {image.visibility === "restricted" && image.clients.length === 0 && (
              <Alert data-color="warning" data-size="sm">
                {t("access.noClients")}
              </Alert>
            )}
          </>
        )}
      </section>

      <section className="panel-section">
        <h3 className="section-title">{t("panel.metadata")}</h3>
        <dl className="key-values">
          <dt>{t("panel.description")}</dt>
          <dd>{image.description ?? t("panel.none")}</dd>
          <dt>{t("panel.altText")}</dt>
          <dd>{image.altText ?? t("panel.none")}</dd>
          <dt>{t("panel.keywords")}</dt>
          <dd>{image.keywords.length > 0 ? image.keywords.join(", ") : t("panel.none")}</dd>
        </dl>
      </section>

      <footer className="panel-footer">
        {edit ? (
          <>
            <Button onClick={save} loading={pending}>
              {t("panel.save")}
            </Button>
            <Button variant="secondary" onClick={cancelEdit} disabled={pending}>
              {t("panel.cancel")}
            </Button>
            <span className="save-status" data-state={changes > 0 ? "unsaved" : undefined}>
              {changes > 0 ? t("panel.unsaved", { n: changes }) : t("panel.noChanges")}
            </span>
          </>
        ) : (
          <>
            {canPublish && (
              <Button
                onClick={() => (image.missingFields.length > 0 ? setDialogOpen(true) : publish())}
                disabled={unfinished || pending}
                aria-describedby={unfinished ? reasonId : undefined}
              >
                {t("panel.publish")}
              </Button>
            )}
            <Button ref={editRef} variant="secondary" onClick={startEdit}>
              {t("panel.edit")}
            </Button>
            {canPublish && unfinished && (
              <p id={reasonId} className="panel-reason">
                {t("panel.notReady")}
              </p>
            )}
          </>
        )}
      </footer>

      <PublishDialog
        open={dialogOpen}
        missingFields={image.missingFields}
        onConfirm={publish}
        onCancel={() => setDialogOpen(false)}
      />
    </section>
  );
}
