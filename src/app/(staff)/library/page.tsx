import { Heading, Link } from "@digdir/designsystemet-react";
import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { ContextSidebar } from "@/app/_components/shell/sidebar";
import { EmptyState, PageMain } from "@/app/_components/shell/shell";
import { getDb } from "@/db/client";
import { listActiveClients } from "@/modules/accounts";
import { requireStaff } from "@/modules/auth";
import { getLibraryImage, listLibrary } from "@/modules/images";
import { currentLicenceType, formatPrice } from "@/modules/licences";
import { DetailsPanel } from "./details-panel";
import { ImageWall } from "./image-wall";

const pageParam = z.coerce.number().int().min(1).catch(1);

// Staff landing page: the Library wall, newest first, and the Details panel of the image selected in the
// URL (`?image=<id>&page=<n>`), so the panel is server-rendered and survives a reload. A page past the end
// shows the last page.
export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const actor = await requireStaff();
  const t = await getTranslations("library");
  const params = await searchParams;
  const imageId = z.uuid().safeParse(params.image);
  const library = await listLibrary(actor, pageParam.parse(params.page));
  const selected = imageId.success ? await getLibraryImage(actor, imageId.data) : null;
  const licenceType = await currentLicenceType(getDb());
  const paidPrice = licenceType ? formatPrice(licenceType.priceMinor, licenceType.currency) : null;
  const activeClients = selected ? await listActiveClients() : [];

  return (
    <>
      <ContextSidebar label={t("filters")} toggleLabel={t("filtersToggle")}>
        <h2 className="sidebar-heading">{t("filters")}</h2>
        {library.total === 0 && <p className="muted">{t("filtersEmpty")}</p>}
      </ContextSidebar>
      <PageMain>
        <Heading level={1} className="visually-hidden">
          {t("title")}
        </Heading>
        {library.total === 0 ? (
          <EmptyState
            text={t("empty")}
            action={
              <Link asChild>
                <NextLink href="/upload">{t("emptyAction")}</NextLink>
              </Link>
            }
          />
        ) : (
          <div className="library" data-panel={selected ? "open" : undefined}>
            <ImageWall
              items={library.items}
              total={library.total}
              page={library.page}
              pageCount={library.pageCount}
              selectedId={selected?.id}
              paidPrice={paidPrice}
            />
            {selected && (
              <DetailsPanel key={selected.id} image={selected} activeClients={activeClients} paidPrice={paidPrice} />
            )}
          </div>
        )}
      </PageMain>
    </>
  );
}
