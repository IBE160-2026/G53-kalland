import { Heading, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@digdir/designsystemet-react";
import { getTranslations } from "next-intl/server";
import { EmptyState, PageMain } from "@/app/_components/shell/shell";
import { requireStaff } from "@/modules/auth";
import { formatPrice, listLicences } from "@/modules/licences";
import { formatOsloDateTime } from "@/modules/shared/time";

// The staff Licences tab (FR-41, UX-DR-42, first cuts): the transaction log, newest first, from the facts
// stored with each licence. Filters, paging and revoked rows come with Epic 5.
export default async function LicencesPage() {
  const actor = await requireStaff();
  const t = await getTranslations("licences");
  const rows = await listLicences(actor);

  return (
    <PageMain>
      <Heading level={1} className="page-title">
        {t("title")}
      </Heading>
      {rows.length === 0 ? (
        <EmptyState text={t("empty")} />
      ) : (
        <Table className="licence-table" zebra>
          <caption className="visually-hidden">{t("caption")}</caption>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t("client")}</TableHeaderCell>
              <TableHeaderCell>{t("contact")}</TableHeaderCell>
              <TableHeaderCell>{t("image")}</TableHeaderCell>
              <TableHeaderCell>{t("licenceType")}</TableHeaderCell>
              <TableHeaderCell>{t("price")}</TableHeaderCell>
              <TableHeaderCell>{t("date")}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.clientName}</TableCell>
                <TableCell>{row.contactName ?? t("noContact")}</TableCell>
                <TableCell>{row.imageTitle}</TableCell>
                <TableCell>{row.licenceTypeName}</TableCell>
                <TableCell>{formatPrice(row.priceMinor, row.currency)}</TableCell>
                <TableCell>{formatOsloDateTime(row.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageMain>
  );
}
