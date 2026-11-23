// Public API of the auth module (AD-3, AD-5). Owns (writes) the tables: credentials, sessions, setup_links, login_attempts.
// Auth alone touches cookies, sessions and password hashes.
export { assertStaff, landingPathFor, LOGIN_PATH, type Actor } from "./actor";
export { setSessionCookie } from "./cookies";
export { currentActor, endCurrentSession, requireContact, requireStaff } from "./guards";
export { assertSameOrigin } from "./origin";
export { REQUEST_PATH_HEADER } from "./request-path";
export { safeReturnTo } from "./return-to";
export { login, logout, resolveSession, setPassword, type SessionResult } from "./sessions";
