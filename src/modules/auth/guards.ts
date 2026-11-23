import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { LOGIN_PATH, type Actor } from "./actor";
import { clearSessionCookie, readSessionToken } from "./cookies";
import { REQUEST_PATH_HEADER } from "./request-path";
import { safeReturnTo } from "./return-to";
import { logout, resolveSession } from "./sessions";

async function requireRole(role: Actor["role"] | "any"): Promise<Actor> {
  const result = await resolveSession(await readSessionToken(), new Date());
  if (result.status === "inactive") redirect(`${LOGIN_PATH}?reason=inactive`);
  if (result.status !== "active") {
    const returnTo = safeReturnTo((await headers()).get(REQUEST_PATH_HEADER));
    redirect(returnTo ? `${LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}` : LOGIN_PATH);
  }
  if (role !== "any" && result.actor.role !== role) forbidden();
  return result.actor;
}

// The first statement of every staff page, Server Action and Route Handler (AD-5).
export function requireStaff(): Promise<Extract<Actor, { role: "staff" }>> {
  return requireRole("staff") as Promise<Extract<Actor, { role: "staff" }>>;
}

// The first statement of every client page, Server Action and Route Handler (AD-5).
export function requireContact(): Promise<Extract<Actor, { role: "contact" }>> {
  return requireRole("contact") as Promise<Extract<Actor, { role: "contact" }>>;
}

// The first statement of a Route Handler that serves both roles, such as the image files (AD-15). The
// handler then asks access (contact) or the staff path itself which data the actor gets.
export function requireUser(): Promise<Actor> {
  return requireRole("any");
}

// The current user, or null. Only for the public entry points (root redirect); never a guard.
// A deactivated user or client still goes to Login with the inactive message.
export async function currentActor(): Promise<Actor | null> {
  const result = await resolveSession(await readSessionToken(), new Date());
  if (result.status === "inactive") redirect(`${LOGIN_PATH}?reason=inactive`);
  return result.status === "active" ? result.actor : null;
}

// Logs out whoever holds the current cookie: deletes the session server-side and clears the cookie.
// Needs no guard: it only ends the caller's own session, and is a no-op without one.
export async function endCurrentSession(): Promise<void> {
  await logout(await readSessionToken());
  await clearSessionCookie();
}
