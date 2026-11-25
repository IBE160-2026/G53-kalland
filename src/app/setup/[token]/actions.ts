"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  endCurrentSession,
  landingPathFor,
  LOGIN_PATH,
  PASSWORD_TOO_LONG,
  PASSWORD_TOO_SHORT,
  redeemSetupLink,
  SETUP_LINK_EXPIRED,
  setSessionCookie,
} from "@/modules/auth";
import { Forbidden, toFormState, Validation, type FormState } from "@/modules/shared/errors";

// A password of the wrong length is the field's inline error; the link stays valid.
export type SetPasswordState = FormState & { fieldError?: string };

const PASSWORD_ERRORS = new Set([PASSWORD_TOO_SHORT, PASSWORD_TOO_LONG]);

// The set-password form's action, bound to the link's token. Public, like the page: the link is the
// credential. On success the browser's earlier session ends and the user lands logged in.
export async function setPasswordFromLink(token: string, _previous: SetPasswordState, formData: FormData): Promise<SetPasswordState> {
  const password = z.string().safeParse(formData.get("password") ?? "");
  if (!password.success) return { fieldError: PASSWORD_TOO_SHORT };

  let target: string;
  try {
    const session = await redeemSetupLink(token, password.data);
    await endCurrentSession();
    await setSessionCookie(session.token);
    target = landingPathFor(session.actor);
  } catch (error) {
    if (error instanceof Validation && PASSWORD_ERRORS.has(error.messageKey)) return { fieldError: error.messageKey };
    if (error instanceof Validation && error.messageKey === SETUP_LINK_EXPIRED) redirect(`${LOGIN_PATH}?reason=expired`);
    if (error instanceof Forbidden && error.messageKey === "login.inactive") redirect(`${LOGIN_PATH}?reason=inactive`);
    return toFormState(error);
  }
  redirect(target);
}
