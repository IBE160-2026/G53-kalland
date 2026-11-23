"use client";

import { useId, type Ref } from "react";
import { useTranslations } from "next-intl";
import { Alert, Chip, Field, Label, Select, ToggleGroup } from "@digdir/designsystemet-react";
import type { LibraryImage } from "@/modules/images";

export type AccessValue = {
  visibility: LibraryImage["visibility"];
  priceTier: LibraryImage["priceTier"];
  clients: { id: string; name: string }[];
};

// The access controls in edit mode (UX-DR-23): Visibility and Price toggle groups, a one-line hint under
// Visibility, client chips and "Add client" only for Restricted with the S4 warning when none is chosen,
// and for Paid the current licence price, read-only. There is no per-image amount (AD-18).
export function AccessControls({
  value,
  onChange,
  activeClients,
  paidPrice,
  visibilityRef,
}: {
  value: AccessValue;
  onChange: (value: AccessValue) => void;
  activeClients: { id: string; name: string }[];
  paidPrice: string | null;
  visibilityRef?: Ref<HTMLFieldSetElement>;
}) {
  const t = useTranslations("library.access");
  const ids = { visibility: useId(), hint: useId(), price: useId(), clients: useId() };
  const chosen = new Set(value.clients.map((client) => client.id));
  const addable = activeClients.filter((client) => !chosen.has(client.id));

  return (
    <div className="access-controls">
      <div className="access-group">
        <span id={ids.visibility} className="access-label">
          {t("visibility")}
        </span>
        <ToggleGroup
          ref={visibilityRef}
          aria-labelledby={ids.visibility}
          aria-describedby={ids.hint}
          data-size="sm"
          value={value.visibility}
          onChange={(visibility) => onChange({ ...value, visibility: visibility as AccessValue["visibility"] })}
        >
          <ToggleGroup.Item value="internal">{t("option.internal")}</ToggleGroup.Item>
          <ToggleGroup.Item value="restricted">{t("option.restricted")}</ToggleGroup.Item>
          <ToggleGroup.Item value="public">{t("option.public")}</ToggleGroup.Item>
        </ToggleGroup>
        <p id={ids.hint} className="access-hint">
          {t(`hint.${value.visibility}`)}
        </p>
      </div>

      {value.visibility === "restricted" && (
        <div className="access-group">
          <span id={ids.clients} className="access-label">
            {t("clients")}
          </span>
          {value.clients.length > 0 && (
            <ul className="access-chips" aria-labelledby={ids.clients}>
              {value.clients.map((client) => (
                <li key={client.id}>
                  <Chip.Removable
                    aria-label={t("removeClient", { name: client.name })}
                    onClick={() => onChange({ ...value, clients: value.clients.filter((c) => c.id !== client.id) })}
                  >
                    {client.name}
                  </Chip.Removable>
                </li>
              ))}
            </ul>
          )}
          {value.clients.length === 0 && (
            <Alert data-color="warning" data-size="sm">
              {t("noClients")}
            </Alert>
          )}
          {addable.length > 0 && (
            <Field>
              <Label>{t("addClient")}</Label>
              <Select
                value=""
                width="auto"
                onChange={(event) => {
                  const client = addable.find((c) => c.id === event.target.value);
                  if (client) onChange({ ...value, clients: [...value.clients, client] });
                }}
              >
                <Select.Option value="">{t("chooseClient")}</Select.Option>
                {addable.map((client) => (
                  <Select.Option key={client.id} value={client.id}>
                    {client.name}
                  </Select.Option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      )}

      <div className="access-group">
        <span id={ids.price} className="access-label">
          {t("price")}
        </span>
        <ToggleGroup
          aria-labelledby={ids.price}
          data-size="sm"
          value={value.priceTier}
          onChange={(priceTier) => onChange({ ...value, priceTier: priceTier as AccessValue["priceTier"] })}
        >
          <ToggleGroup.Item value="free">{t("option.free")}</ToggleGroup.Item>
          <ToggleGroup.Item value="paid">{t("option.paid")}</ToggleGroup.Item>
        </ToggleGroup>
        {value.priceTier === "paid" && paidPrice && <p className="access-price price">{t("pricePerLicence", { price: paidPrice })}</p>}
      </div>
    </div>
  );
}
