// True when a database error (bare, or wrapped by Drizzle as its cause) is a unique-constraint violation.
export function isUniqueViolation(error: unknown): boolean {
  for (let e: unknown = error; e instanceof Error; e = e.cause) {
    if ((e as { code?: unknown }).code === "23505") return true;
  }
  return false;
}
