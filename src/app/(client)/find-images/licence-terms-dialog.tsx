"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Dialog, Heading, Paragraph } from "@digdir/designsystemet-react";

// "Read the licence terms" and the dialog with the licence type's current text (UX-DR-35). Escape or
// Close closes it; focus returns to the button. The text is rendered as escaped React text.
export function LicenceTermsDialog({ name, text }: { name: string; text: string }) {
  const t = useTranslations("findImages.licence");
  const headingId = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="tertiary" data-size="sm" onClick={() => setOpen(true)}>
        {t("readTerms")}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} closeButton={t("close")} aria-labelledby={headingId}>
        <Dialog.Block>
          <Heading level={2} data-size="xs" id={headingId}>
            {t("termsTitle", { name })}
          </Heading>
        </Dialog.Block>
        <Dialog.Block>
          <Paragraph className="licence-text">{text}</Paragraph>
        </Dialog.Block>
      </Dialog>
    </>
  );
}
