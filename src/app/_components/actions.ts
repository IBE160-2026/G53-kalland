"use server";

import { redirect } from "next/navigation";
import { endCurrentSession, LOGIN_PATH } from "@/modules/auth";

// Ends the caller's own session for either role. No role guard: it acts only on the caller's cookie.
export async function logOut(): Promise<void> {
  await endCurrentSession();
  redirect(LOGIN_PATH);
}
