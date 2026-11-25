// Public API of the licences module (AD-3). Owns (writes) the tables: licence_types, licence_texts, licences, cart_items.
export { checkOut, type CheckoutInput, type CheckoutResult } from "./checkout";
export { grantLicence, type GrantInput, type Licence, type LicenceSource } from "./grant";
export { getClientLicence, listLicences, type ClientLicence, type LicenceLogRow } from "./log";
export { formatAmount, formatPrice } from "./money";
export {
  currentLicenceText,
  currentLicenceType,
  ensureStandardLicenceType,
  type LicenceText,
  type LicenceType,
} from "./types";
