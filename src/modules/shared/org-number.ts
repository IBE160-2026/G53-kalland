// Norwegian organisation numbers (FR-1): nine digits, the last a mod-11 check digit over the first eight.
const WEIGHTS = [3, 2, 7, 6, 5, 4, 3, 2];

// Removes all whitespace, so "921 456 786" becomes "921456786". Anything else is left for the check.
export function normaliseOrgNumber(value: string): string {
  return value.replace(/\s+/g, "");
}

// True for nine digits whose check digit is right. A remainder of 1 has no valid check digit.
export function isValidOrgNumber(value: string): boolean {
  if (!/^[0-9]{9}$/.test(value)) return false;
  const digits = [...value].map(Number);
  const sum = WEIGHTS.reduce((total, weight, i) => total + weight * digits[i], 0);
  const remainder = sum % 11;
  if (remainder === 1) return false;
  const check = remainder === 0 ? 0 : 11 - remainder;
  return check === digits[8];
}
