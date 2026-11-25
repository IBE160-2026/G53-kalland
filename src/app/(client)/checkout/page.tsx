import { Heading } from "@digdir/designsystemet-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { PageMain } from "@/app/_components/shell/shell";
import { getDb } from "@/db/client";
import { getClientImage } from "@/modules/access";
import { requireContact } from "@/modules/auth";
import { currentLicenceText, currentLicenceType, formatPrice } from "@/modules/licences";
import { CheckoutForm } from "./checkout-form";

// Single-image checkout (`/checkout?image=<id>`, FR-32 first cut; the Epic 5 cart replaces the entry
// point). Only for an image the contact's client may buy now: anything else is Not found (AD-6).
export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const actor = await requireContact();
  const t = await getTranslations("checkout");
  const params = await searchParams;
  const imageId = z.string().safeParse(params.image);
  const image = imageId.success ? await getClientImage(actor, imageId.data) : null;
  if (!image || !image.canBuy || image.price === "free") notFound();
  const db = getDb();
  const type = await currentLicenceType(db);
  if (!type || type.id !== image.price.licenceTypeId) notFound();
  const text = await currentLicenceText(db, type.id);

  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("title")}
      </Heading>
      <CheckoutForm
        line={{
          imageId: image.id,
          title: image.title,
          licenceTypeId: type.id,
          licenceName: type.name,
          priceMinor: image.price.priceMinor,
          priceLabel: formatPrice(image.price.priceMinor, image.price.currency),
        }}
        termsText={text?.body ?? null}
      />
    </PageMain>
  );
}
