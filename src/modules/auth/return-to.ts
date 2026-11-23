import { LOGIN_PATH } from "./actor";

const BASE = "http://return-to.invalid";

// Returns raw if it is a same-origin relative path that is safe to redirect to after login, else null.
export function safeReturnTo(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2000) return null;
  // Only "/x" paths: no "//host", no backslashes ("/\host"), no control characters or spaces.
  if (!raw.startsWith("/") || raw.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return null;
  }
  if (url.origin !== BASE) return null;
  if (url.pathname === LOGIN_PATH || url.pathname.startsWith(`${LOGIN_PATH}/`)) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}
