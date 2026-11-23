import { cookies } from "next/headers";

export const SESSION_COOKIE = "crm_dam_session";

// HttpOnly, SameSite=Lax, and Secure whenever the app is served over https (AD-4).
export function sessionCookieOptions(appOrigin = process.env.APP_ORIGIN ?? "") {
  return { httpOnly: true, sameSite: "lax", secure: appOrigin.toLowerCase().startsWith("https://"), path: "/" } as const;
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// Only Server Actions and Route Handlers may call this; Server Components cannot change cookies.
export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
