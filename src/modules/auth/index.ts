// Public API of the auth module (AD-3, AD-5). Owns (writes) the tables: credentials, sessions, setup_links, login_attempts.
// Auth alone touches cookies, sessions, password hashes and setup-link tokens.
export { assertContact, assertStaff, landingPathFor, LOGIN_PATH, type Actor } from "./actor";
export { setSessionCookie } from "./cookies";
export { currentActor, endCurrentSession, requireContact, requireStaff, requireUser } from "./guards";
export { assertSameOrigin } from "./origin";
export { REQUEST_PATH_HEADER } from "./request-path";
export { safeReturnTo } from "./return-to";
export { login, logout, resolveSession, setPassword, type SessionResult } from "./sessions";
export {
  isSetupLinkValid,
  issueSetupLink,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_TOO_LONG,
  PASSWORD_TOO_SHORT,
  redeemSetupLink,
  SETUP_LINK_EXPIRED,
  SETUP_LINK_TTL_MS,
  type SetupLink,
} from "./setup-links";
