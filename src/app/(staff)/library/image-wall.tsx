"use client";

import Image from "next/image";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Pagination, usePagination } from "@digdir/designsystemet-react";
import { StatusTag } from "@/app/_components/status-tag";
import type { LibraryItem } from "@/modules/images";

function libraryHref(page: number, imageId?: string): string {
  const params = new URLSearchParams();
  if (imageId) params.set("image", imageId);
  params.set("page", String(page));
  return `/library?${params}`;
}

// One tile (UX-DR-13): a link that selects the image, at its own aspect ratio, with status tags, the
// title or "Untitled image", and the meta line (visibility and price). Titles are untrusted text, rendered escaped.
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
  const width = item.width ?? 1;
  const height = item.height ?? 1;
  const ratio = width / height;
  return (
    <li className="wall-tile" style={{ flexGrow: ratio, flexBasis: `calc(var(--wall-row-height) * ${ratio})` }}>
      <NextLink
        href={libraryHref(page, item.id)}
        scroll={false}
        className="wall-tile-link"
        aria-current={selected ? "true" : undefined}
      >
        <span className="wall-tile-image" style={{ aspectRatio: `${width} / ${height}` }}>
          {item.processingState !== "uploading" && item.width !== null && (
            <Image src={`/api/images/${item.id}/thumbnail`} alt="" width={width} height={height} unoptimized />
          )}
          <span className="wall-tile-tags">
            <StatusTag state={item.status}>{t(`tag.${item.status}`)}</StatusTag>
            {item.processingState !== "ready" && (
              <StatusTag state={item.processingState}>{t(`tag.${item.processingState}`)}</StatusTag>
            )}
          </span>
        </span>
        <span className="wall-tile-caption">
          <span className="wall-tile-title">{item.title}</span>
          <span className="wall-tile-meta">
            <span>{visibility}</span>
            <span className="visually-hidden">, </span>
            <span aria-hidden="true"> · </span>
            <span className="price">{price}</span>
          </span>
        </span>
      </NextLink>
    </li>
  );
}

function LibraryPagination({ page, pageCount, selectedId }: { page: number; pageCount: number; selectedId?: string }) {
  const t = useTranslations("library");
  const { pages, hasPrev, hasNext } = usePagination({ currentPage: page, totalPages: pageCount, showPages: 7 });
  return (
    <Pagination aria-label={t("pagination")} className="wall-pagination">
      <Pagination.List>
        <Pagination.Item>
          {hasPrev && (
            <Pagination.Button asChild variant="tertiary">
              <NextLink href={libraryHref(page - 1, selectedId)}>{t("previous")}</NextLink>
            </Pagination.Button>
          )}
        </Pagination.Item>
        {pages.map(({ page: number, itemKey }) => (
          <Pagination.Item key={itemKey}>
            {typeof number === "number" && (
              <Pagination.Button asChild aria-current={number === page ? "page" : undefined}>
                <NextLink href={libraryHref(number, selectedId)} aria-label={t("pageLabel", { n: number })}>
                  {number}
                </NextLink>
              </Pagination.Button>
            )}
          </Pagination.Item>
        ))}
        <Pagination.Item>
          {hasNext && (
            <Pagination.Button asChild variant="tertiary">
              <NextLink href={libraryHref(page + 1, selectedId)}>{t("next")}</NextLink>
            </Pagination.Button>
          )}
        </Pagination.Item>
      </Pagination.List>
    </Pagination>
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
  const t = useTranslations("library");
  return (
    <div className="wall">
      <p className="wall-count">{t("count", { n: total })}</p>
      <ul className="wall-tiles" aria-label={t("wall")}>
        {items.map((item) => (
          <Tile key={item.id} item={item} page={page} selected={item.id === selectedId} paidPrice={paidPrice} />
        ))}
      </ul>
      {pageCount > 1 && <LibraryPagination page={page} pageCount={pageCount} selectedId={selectedId} />}
    </div>
  );
}
