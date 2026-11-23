"use client";

import { useTranslations } from "next-intl";
import { StatusTag } from "@/app/_components/status-tag";
import { Wall, WallTile } from "@/app/_components/wall/wall";
import type { LibraryItem } from "@/modules/images";

function libraryHref(page: number, imageId?: string): string {
  const params = new URLSearchParams();
  if (imageId) params.set("image", imageId);
  params.set("page", String(page));
  return `/library?${params}`;
}

// One Library tile (UX-DR-13): status tags on the image, and the meta line (visibility and price).
function Tile({ item, page, selected, paidPrice }: { item: LibraryItem; page: number; selected: boolean; paidPrice: string | null }) {
  const t = useTranslations("library");
  // Public, the restricted list's client names, or Internal only (restricted without clients behaves as
  // internal, S4); then the price.
  const visibility =
    item.visibility === "public"
      ? t("visibility.public")
      : item.visibility === "restricted" && item.clientNames.length > 0
        ? item.clientNames.join(", ")
        : t("visibility.internal");
  const price = item.priceTier === "free" ? t("free") : (paidPrice ?? t("paid"));
  return (
    <WallTile
      imageId={item.id}
      href={libraryHref(page, item.id)}
      selected={selected}
      width={item.width}
      height={item.height}
      showImage={item.processingState !== "uploading"}
      overlay={
        <span className="wall-tile-tags">
          <StatusTag state={item.status}>{t(`tag.${item.status}`)}</StatusTag>
          {item.processingState !== "ready" && <StatusTag state={item.processingState}>{t(`tag.${item.processingState}`)}</StatusTag>}
        </span>
      }
      title={item.title}
      meta={
        <>
          <span>{visibility}</span>
          <span className="visually-hidden">, </span>
          <span aria-hidden="true"> · </span>
          <span className="price">{price}</span>
        </>
      }
    />
  );
}

// The Library wall (UX-DR-11, first cut): count, justified rows newest first, pagination below.
export function ImageWall({
  items,
  total,
  page,
  pageCount,
  selectedId,
  paidPrice,
}: {
  items: LibraryItem[];
  total: number;
  page: number;
  pageCount: number;
  selectedId?: string;
  paidPrice: string | null;
}) {
  return (
    <Wall total={total} page={page} pageCount={pageCount} selectedId={selectedId} hrefFor={libraryHref}>
      {items.map((item) => (
        <Tile key={item.id} item={item} page={page} selected={item.id === selectedId} paidPrice={paidPrice} />
      ))}
    </Wall>
  );
}
