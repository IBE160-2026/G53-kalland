"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { Button, Dialog, Heading, Paragraph } from "@digdir/designsystemet-react";
import type { MetadataField } from "@/modules/images";

// The confirm dialog for publishing with missing metadata (UX-DR-46): says what is missing and what
// that means; the primary action publishes, "Go back" or Escape cancels. Focus returns to the trigger.
export function PublishDialog({
  open,
  missingFields,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  missingFields: MetadataField[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("library.publishDialog");
  const headingId = useId();
  const fields = missingFields.map((field) => t(`fields.${field}`)).join(", ");
  return (
    <Dialog open={open} onClose={onCancel} closeButton={false} aria-labelledby={headingId}>
      <Dialog.Block>
        <Heading level={2} data-size="xs" id={headingId}>
          {t("title")}
        </Heading>
        <Paragraph>{t("body", { fields })}</Paragraph>
      </Dialog.Block>
      <Dialog.Block className="dialog-actions">
        <Button onClick={onConfirm}>
          {t("confirm")}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          {t("goBack")}
        </Button>
      </Dialog.Block>
    </Dialog>
  );
}
