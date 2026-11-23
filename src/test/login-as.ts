import { login, type Actor } from "@/modules/auth";
import { DEMO_PASSWORD, type FixtureUser } from "@/db/seed/fixture";

// Logs a fixture user in through the auth module and returns their Actor and session token (AD-7).
export async function loginAs(user: FixtureUser, now?: Date): Promise<{ actor: Actor; token: string }> {
  return login(user.email, DEMO_PASSWORD, now);
}
