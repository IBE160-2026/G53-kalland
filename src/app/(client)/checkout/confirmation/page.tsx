import { Heading, Link, Paragraph } from "@digdir/designsystemet-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { PageMain } from "@/app/_components/shell/shell";
import { requireContact } from "@/modules/auth";
import { formatPrice, getClientLicence } from "@/modules/licences";
import { formatOsloDateTime } from "@/modules/shared/time";

// The checkout confirmation (`/checkout/confirmation?licence=<id>`, UX-DR-37 first cut): the licensed
// image and a link back to Find images. Downloads come with Epic 5. A licence of another client is Not found.
export default async function CheckoutConfirmationPage({ searchParams }: PageProps<"/checkout/confirmation">) {
  const actor = await requireContact();
  const t = await getTranslations("checkout");
  const params = await searchParams;
  const licenceId = z.string().safeParse(params.licence);
  const licence = licenceId.success ? await getClientLicence(actor, licenceId.data) : null;
  if (!licence) notFound();

  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("confirmation.title")}
      </Heading>
      <div className="checkout">
        <Paragraph>{t("confirmation.body")}</Paragraph>
        <ul className="checkout-lines" aria-label={t("lines")}>
          <li className="checkout-line">
            <span className="checkout-line-title">{licence.imageTitle}</span>
            <span className="checkout-line-licence">
              {licence.licenceTypeName} · {t("confirmation.licensed", { date: formatOsloDateTime(licence.createdAt) })}
            </span>
            <span className="price price-lg">{formatPrice(licence.priceMinor, licence.currency)}</span>
          </li>
        </ul>
        <Link asChild>
          <NextLink href="/find-images">{t("backToFindImages")}</NextLink>
        </Link>
      </div>
    </PageMain>
  );
}
