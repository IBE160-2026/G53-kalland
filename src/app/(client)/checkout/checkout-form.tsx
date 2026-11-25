"use client";

import { startTransition, useActionState, useId, useState, type FormEvent } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Alert, Button, Checkbox, Link, Paragraph } from "@digdir/designsystemet-react";
import { LicenceTermsDialog } from "../find-images/licence-terms-dialog";
import { checkOutAction, type CheckoutState } from "./actions";

// The one checkout line, as the page read it through access.
export type CheckoutLine = {
  imageId: string;
  title: string;
  licenceTypeId: string;
  licenceName: string;
  priceMinor: number;
  priceLabel: string;
};

// The checkout (UX-DR-37, first cut): the line, the licence terms, the terms checkbox and Check out, which
// stays disabled with the reason next to it until the box is ticked (UX-DR-45). A price change shows the
// NFR-7 message and "Confirm new price", which submits the new price; a removed line shows the NFR-7
// message and offers no checkout. While a submit runs the button is disabled, and the server records at
// most one licence however often the form is sent (S5).
export function CheckoutForm({ line, termsText }: { line: CheckoutLine; termsText: string | null }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(checkOutAction, {});
  const [accepted, setAccepted] = useState(false);
  const reasonId = useId();

  // Submitted from onSubmit rather than the form's action prop, so React does not reset the form after a
  // price change: the ticked terms box and the new price stay as they are for "Confirm new price".
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  if (state.removed) {
    return (
      <div className="checkout">
        <Alert role="alert" data-color="warning" data-size="sm">
          {t("checkout.removed", { title: state.removed.title })}
        </Alert>
        <Link asChild>
          <NextLink href="/find-images">{t("checkout.backToFindImages")}</NextLink>
        </Link>
      </div>
    );
  }

  const changed = state.priceChanged;
  const licenceTypeId = changed?.licenceTypeId ?? line.licenceTypeId;
  const priceMinor = changed?.newMinor ?? line.priceMinor;
  const priceLabel = changed?.newPriceLabel ?? line.priceLabel;

  return (
    <form className="checkout" onSubmit={submit}>
      {changed && (
        <Alert role="alert" data-color="warning" data-size="sm">
          {t("checkout.priceChanged", { title: changed.title, oldPrice: changed.oldPrice, newPrice: changed.newPrice })}
        </Alert>
      )}
      {state.error && (
        <Alert role="alert" data-color="danger" data-size="sm">
          {t(state.error)}
        </Alert>
      )}
      <ul className="checkout-lines" aria-label={t("checkout.lines")}>
        <li className="checkout-line">
          <span className="checkout-line-title">{line.title}</span>
          <span className="checkout-line-licence">{line.licenceName}</span>
          <span className="price price-lg">{priceLabel}</span>
        </li>
      </ul>
      {termsText && <LicenceTermsDialog name={line.licenceName} text={termsText} />}
      <Paragraph data-size="sm" className="muted">
        {t("checkout.noPayment")} {t("checkout.recheck")}
      </Paragraph>
      <input type="hidden" name="imageId" value={line.imageId} />
      <input type="hidden" name="seenTitle" value={line.title} />
      <input type="hidden" name="licenceTypeId" value={licenceTypeId} />
      <input type="hidden" name="seenPriceMinor" value={priceMinor} />
      <Checkbox
        name="terms"
        value="accepted"
        label={t("checkout.acceptTerms")}
        checked={accepted}
        onChange={(event) => setAccepted(event.target.checked)}
      />
      <div className="checkout-actions">
        <Button type="submit" disabled={!accepted || pending} loading={pending} aria-describedby={accepted ? undefined : reasonId}>
          {changed ? t("checkout.confirmNewPrice") : t("checkout.submit")}
        </Button>
        {!accepted && (
          <p id={reasonId} className="checkout-reason">
            {t("checkout.termsRequired")}
          </p>
        )}
      </div>
    </form>
  );
}
