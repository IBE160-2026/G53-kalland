"use client";

import { useTranslations } from "next-intl";
import { CheckIcon } from "@/app/_components/shell/icons";
import { Wall, WallTile } from "@/app/_components/wall/wall";

// What a client tile shows. The page builds it from the ClientImage, with the price already formatted.
export type ClientTile = { id: string; title: string; width: number | null; height: number | null; own: boolean; priceLabel: string };

function findImagesHref(page: number, imageId?: string): string {
  const params = new URLSearchParams();
  if (imageId) params.set("image", imageId);
  params.set("page", String(page));
  return `/find-images?${params}`;
}

// The Find images wall (FR-28, first cut; UX-DR-13, UX-DR-15, UX-DR-16): an own image gets the tick on
// the image and "Yours to download"; every other tile its price ("90 USD") or "Free".
export function ClientWall({
  tiles,
  total,
  page,
  pageCount,
  selectedId,
}: {
  tiles: ClientTile[];
  total: number;
  page: number;
  pageCount: number;
  selectedId?: string;
}) {
  const t = useTranslations("findImages");
  return (
    <Wall total={total} page={page} pageCount={pageCount} selectedId={selectedId} hrefFor={findImagesHref}>
      {tiles.map((tile) => (
        <WallTile
          key={tile.id}
          imageId={tile.id}
          href={findImagesHref(page, tile.id)}
          selected={tile.id === selectedId}
          width={tile.width}
          height={tile.height}
          showImage
          overlay={tile.own ? <CheckIcon className="own-tick" /> : undefined}
          title={tile.title}
          meta={
            tile.own ? (
              <span className="own-label">
                <CheckIcon className="own-tick-inline" />
                {t("yoursToDownload")}
              </span>
            ) : (
              <span className="price">{tile.priceLabel}</span>
            )
          }
        />
      ))}
    </Wall>
  );
}
