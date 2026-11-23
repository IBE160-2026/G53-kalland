import { Heading } from "@digdir/designsystemet-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { EmptyState, PageMain } from "@/app/_components/shell/shell";
import { getDb } from "@/db/client";
import { getClientImage, listClientImages, type ClientImage } from "@/modules/access";
import { requireContact } from "@/modules/auth";
import { currentLicenceText, currentLicenceType, formatPrice } from "@/modules/licences";
import { ClientDetailsPanel, type LicenceOffer } from "./client-details-panel";
import { ClientWall, type ClientTile } from "./client-wall";

const pageParam = z.coerce.number().int().min(1).catch(1);

function priceLabel(image: ClientImage, free: string): string {
  return image.price === "free" ? free : formatPrice(image.price.priceMinor, image.price.currency);
}

// The licence option for a buyable image: its licence type's name, price and current text.
async function licenceOffer(image: ClientImage): Promise<LicenceOffer | null> {
  if (!image.canBuy || image.price === "free") return null;
  const db = getDb();
  const type = await currentLicenceType(db);
  if (!type || type.id !== image.price.licenceTypeId) return null;
  return {
    name: type.name,
    priceLabel: formatPrice(image.price.priceMinor, image.price.currency),
    text: await currentLicenceText(db, type.id),
  };
}

// Find images (FR-28, FR-30, first cuts): the wall of images the contact's client may see, newest first,
// and the client Details panel of the image selected in the URL (`?image=<id>&page=<n>`). Everything comes
// from access (AD-6); an image the client may not see, or a bad id, gives the Not found page (404).
export default async function FindImagesPage({ searchParams }: PageProps<"/find-images">) {
  const actor = await requireContact();
  const t = await getTranslations("findImages");
  const params = await searchParams;
  let selected: ClientImage | null = null;
  if (params.image !== undefined) {
    const imageId = z.string().safeParse(params.image);
    selected = imageId.success ? await getClientImage(actor, imageId.data) : null;
    if (!selected) notFound();
  }
  const list = await listClientImages(actor, pageParam.parse(params.page));
  const free = t("free");
  const tiles: ClientTile[] = list.items.map((image) => ({
    id: image.id,
    title: image.title,
    width: image.width,
    height: image.height,
    own: image.own,
    priceLabel: priceLabel(image, free),
  }));
  const licence = selected ? await licenceOffer(selected) : null;

  return (
    <PageMain>
      <Heading level={1} className="visually-hidden">
        {t("title")}
      </Heading>
      {list.total === 0 ? (
        <EmptyState text={t("empty")} />
      ) : (
        <div className="library" data-panel={selected ? "open" : undefined}>
          <ClientWall tiles={tiles} total={list.total} page={list.page} pageCount={list.pageCount} selectedId={selected?.id} />
          {selected && <ClientDetailsPanel key={selected.id} image={selected} licence={licence} />}
        </div>
      )}
    </PageMain>
  );
}
