import { Forbidden } from "@/modules/shared/errors";

// Who is acting. A contact's clientId comes only from here, never from input (AD-5).
export type Actor =
  | { userId: string; role: "staff"; clientId?: undefined }
  | { userId: string; role: "contact"; clientId: string };

export function assertStaff(actor: Actor): asserts actor is Extract<Actor, { role: "staff" }> {
  if (actor.role !== "staff") throw new Forbidden();
}

export const LOGIN_PATH = "/login";

export function landingPathFor(actor: Actor): string {
  return actor.role === "staff" ? "/library" : "/overview";
}
