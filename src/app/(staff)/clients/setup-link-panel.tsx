"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Input, Label } from "@digdir/designsystemet-react";
import type { SetupLinkView } from "./contact-actions";

// A new setup link for staff to copy (FR-4): the app sends no email, so staff paste it into their own.
// The URL is selected and focused when it appears; Copy announces "Copied" in a status region.
export function SetupLinkPanel({ name, link }: { name: string; link: SetupLinkView }) {
  const t = useTranslations("contacts.setupLink");
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);

  async function copy() {
    input.current?.select();
    let done: boolean;
    try {
      await navigator.clipboard.writeText(link.url);
      done = true;
    } catch {
      // No Clipboard API (an http origin other than localhost): copy the selected text instead.
      done = document.execCommand("copy");
    }
    // If neither worked, the URL stays selected for staff to copy themselves.
    if (done) setCopied(true);
  }

  return (
    <div className="setup-link" role="group" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="setup-link-title">
        {t("title", { name })}
      </h3>
      <div className="setup-link-row">
        <Label htmlFor={`${id}-url`} className="visually-hidden">
          {t("label")}
        </Label>
        <Input
          ref={input}
          id={`${id}-url`}
          className="setup-link-url"
          type="text"
          readOnly
          value={link.url}
          data-size="sm"
          aria-describedby={`${id}-hint`}
        />
        <Button type="button" data-size="sm" onClick={copy}>
          {t("copy")}
        </Button>
        <span className="setup-link-copied" role="status">
          {copied ? t("copied") : ""}
        </span>
      </div>
      <p id={`${id}-hint`} className="setup-link-hint">
        {t("hint", { name, expires: link.expires })}
      </p>
    </div>
  );
}
