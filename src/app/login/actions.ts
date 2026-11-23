"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { endCurrentSession, landingPathFor, login, safeReturnTo, setSessionCookie } from "@/modules/auth";
import { toFormState, type FormState } from "@/modules/shared/errors";

export type LoginState = FormState & { email?: string };

const loginInput = z.object({
  email: z.string().trim().toLowerCase().min(1).max(320),
  password: z.string().min(1).max(1024),
  returnTo: z.string().optional(),
});

// The Login form's action. Public, like the Login page: it is how a user gets a session.
export async function logIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginInput.safeParse({
    email,
    password: formData.get("password") ?? "",
    returnTo: formData.get("returnTo") ?? undefined,
  });
  if (!parsed.success) return { error: "login.missing", email };

  let target: string;
  try {
    const { token, actor } = await login(parsed.data.email, parsed.data.password);
    // Logging in again must not leave the old session behind the cookie the browser held.
    await endCurrentSession();
    await setSessionCookie(token);
    target = safeReturnTo(parsed.data.returnTo) ?? landingPathFor(actor);
  } catch (error) {
    return { ...toFormState(error), email };
  }
  redirect(target);
}
