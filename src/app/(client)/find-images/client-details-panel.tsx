import { Fragment } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Button } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import type { ClientImage } from "@/modules/access";
import { cameraName, formatDateTaken } from "./format";
import { LicenceTermsDialog } from "./licence-terms-dialog";

// The licence a buyable image is offered under, with its price formatted and its current text.
export type LicenceOffer = { name: string; priceLabel: string; text: string | null };

type Field = { label: string; value: string | null };

// A key-value list without the empty fields; nothing when every field is empty.
function Fields({ fields }: { fields: Field[] }) {
  const present = fields.filter((field): field is { label: string; value: string } => Boolean(field.value?.trim()));
  if (present.length === 0) return null;
  return (
    <dl className="key-values">
      {present.map((field) => (
        <Fragment key={field.label}>
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

// The client Details panel (UX-DR-18, client variant; UX-DR-34, first cut): read-only. Preview, title,
// the licence option for a buyable image (UX-DR-35), "About the image" and "Technical details", with empty
// fields left out. Never location, staff fields or other clients: ClientImage does not carry them (AD-6).
// All image text is untrusted and rendered as escaped React text.
export async function ClientDetailsPanel({ image, licence }: { image: ClientImage; licence: LicenceOffer | null }) {
  const t = await getTranslations("findImages");
  const titleId = `panel-title-${image.id}`;
  const orientation =
    image.width === null || image.height === null
      ? null
      : image.width > image.height
        ? "landscape"
        : image.width < image.height
          ? "portrait"
          : "square";

  const about: Field[] = [
    { label: t("panel.description"), value: image.description },
    { label: t("panel.altText"), value: image.altText },
    { label: t("panel.dateTaken"), value: image.dateTaken ? formatDateTaken(image.dateTaken) : null },
    { label: t("panel.keywords"), value: image.keywords.join(", ") },
  ];
  const technical: Field[] = [
    { label: t("panel.camera"), value: cameraName(image.cameraMake, image.cameraModel) },
    { label: t("panel.lens"), value: image.lens },
    { label: t("panel.exposureTime"), value: image.exposureTime ? `${image.exposureTime} s` : null },
    { label: t("panel.aperture"), value: image.fNumber !== null ? `f/${image.fNumber}` : null },
    { label: t("panel.focalLength"), value: image.focalLength !== null ? `${image.focalLength} mm` : null },
    { label: t("panel.iso"), value: image.iso !== null ? String(image.iso) : null },
    {
      label: t("panel.pixelSize"),
      value:
        orientation && image.width !== null && image.height !== null
          ? t("panel.pixels", { width: image.width, height: image.height, orientation: t(`panel.orientation.${orientation}`) })
          : null,
    },
  ];
  const hasAbout = about.some((field) => field.value?.trim());
  const hasTechnical = technical.some((field) => field.value?.trim());

  return (
    <section className="details-panel" aria-labelledby={titleId}>
      <header className="panel-header">
        <h2 id={titleId} className="panel-title">
          {image.title}
        </h2>
      </header>

      <div className="panel-loupe">
        {image.width !== null && image.height !== null && (
          <Image src={`/api/images/${image.id}/preview`} alt={image.altText?.trim() ? image.altText : image.title} width={image.width} height={image.height} unoptimized />
        )}
      </div>

      {licence && (
        <section className="licence-option" aria-label={t("licence.title")}>
          <p className="licence-option-head">
            <span className="licence-name">{licence.name}</span>
            <span className="visually-hidden"> — </span>
            <span className="price price-lg">{licence.priceLabel}</span>
          </p>
          <p className="licence-scope">{t("licence.scope")}</p>
          {licence.text && <LicenceTermsDialog name={licence.name} text={licence.text} />}
          <Button asChild data-size="sm">
            <NextLink href={`/checkout?image=${image.id}`}>{t("licence.licenseImage")}</NextLink>
          </Button>
        </section>
      )}

      {hasAbout && (
        <section className="panel-section">
          <h3 className="section-title">{t("panel.about")}</h3>
          <Fields fields={about} />
        </section>
      )}

      {hasTechnical && (
        <section className="panel-section">
          <h3 className="section-title">{t("panel.technical")}</h3>
          <Fields fields={technical} />
        </section>
      )}
    </section>
  );
}
