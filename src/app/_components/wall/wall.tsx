"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Pagination, usePagination } from "@digdir/designsystemet-react";

// The address of a wall page, with the image selected in the Details panel if any (`?image=&page=`).
export type WallHref = (page: number, imageId?: string) => string;

// One tile frame (UX-DR-13): a link that selects the image, at its own aspect ratio, with what the caller
// draws on the image (tags, tick) and the caption's title and meta line. Titles are untrusted text,
// rendered escaped.
export function WallTile({
  imageId,
  href,
  selected,
  width,
  height,
  showImage,
  overlay,
  title,
  meta,
}: {
  imageId: string;
  href: string;
  selected: boolean;
  width: number | null;
  height: number | null;
  showImage: boolean;
  overlay?: ReactNode;
  title: string;
  meta: ReactNode;
}) {
  const w = width ?? 1;
  const h = height ?? 1;
  const ratio = w / h;
  return (
    <li className="wall-tile" style={{ flexGrow: ratio, flexBasis: `calc(var(--wall-row-height) * ${ratio})` }}>
      <NextLink href={href} scroll={false} className="wall-tile-link" aria-current={selected ? "true" : undefined}>
        <span className="wall-tile-image" style={{ aspectRatio: `${w} / ${h}` }}>
          {showImage && width !== null && (
            <Image src={`/api/images/${imageId}/thumbnail`} alt="" width={w} height={h} unoptimized />
          )}
          {overlay}
        </span>
        <span className="wall-tile-caption">
          <span className="wall-tile-title">{title}</span>
          <span className="wall-tile-meta">{meta}</span>
        </span>
      </NextLink>
    </li>
  );
}

function WallPagination({ page, pageCount, selectedId, hrefFor }: { page: number; pageCount: number; selectedId?: string; hrefFor: WallHref }) {
  const t = useTranslations("wall");
  const { pages, hasPrev, hasNext } = usePagination({ currentPage: page, totalPages: pageCount, showPages: 7 });
  return (
    <Pagination aria-label={t("pagination")} className="wall-pagination">
      <Pagination.List>
        <Pagination.Item>
          {hasPrev && (
            <Pagination.Button asChild variant="tertiary">
              <NextLink href={hrefFor(page - 1, selectedId)}>{t("previous")}</NextLink>
            </Pagination.Button>
          )}
        </Pagination.Item>
        {pages.map(({ page: number, itemKey }) => (
          <Pagination.Item key={itemKey}>
            {typeof number === "number" && (
              <Pagination.Button asChild aria-current={number === page ? "page" : undefined}>
                <NextLink href={hrefFor(number, selectedId)} aria-label={t("pageLabel", { n: number })}>
                  {number}
                </NextLink>
              </Pagination.Button>
            )}
          </Pagination.Item>
        ))}
        <Pagination.Item>
          {hasNext && (
            <Pagination.Button asChild variant="tertiary">
              <NextLink href={hrefFor(page + 1, selectedId)}>{t("next")}</NextLink>
            </Pagination.Button>
          )}
        </Pagination.Item>
      </Pagination.List>
    </Pagination>
  );
}

// An image wall (UX-DR-11, first cut): count, justified rows of <WallTile>s newest first, pagination below.
export function Wall({
  total,
  page,
  pageCount,
  selectedId,
  hrefFor,
  children,
}: {
  total: number;
  page: number;
  pageCount: number;
  selectedId?: string;
  hrefFor: WallHref;
  children: ReactNode;
}) {
  const t = useTranslations("wall");
  return (
    <div className="wall">
      <p className="wall-count">{t("count", { n: total })}</p>
      <ul className="wall-tiles" aria-label={t("label")}>
        {children}
      </ul>
      {pageCount > 1 && <WallPagination page={page} pageCount={pageCount} selectedId={selectedId} hrefFor={hrefFor} />}
    </div>
  );
}
