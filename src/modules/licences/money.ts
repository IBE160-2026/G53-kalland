// Prices are integer minor units plus an ISO 4217 currency, excluding VAT (Conventions: Money).
// Integer math only: "90" for 9000, "90.50" for 9050. Cents show only when they are not zero.
export function formatAmount(minor: number): string {
  if (!Number.isSafeInteger(minor) || minor < 0) throw new RangeError(`Invalid price in minor units: ${minor}`);
  const major = Math.trunc(minor / 100);
  const cents = minor % 100;
  return cents === 0 ? String(major) : `${major}.${String(cents).padStart(2, "0")}`;
}

// "90 USD" for 9000 minor units in USD.
export function formatPrice(minor: number, currency: string): string {
  return `${formatAmount(minor)} ${currency}`;
}
