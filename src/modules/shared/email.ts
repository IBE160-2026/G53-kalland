// Emails are trimmed and lower-cased everywhere they are stored or looked up (Conventions: Validation).
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}
