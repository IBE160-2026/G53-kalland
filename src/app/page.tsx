import { redirect } from "next/navigation";
import { currentActor, landingPathFor, LOGIN_PATH } from "@/modules/auth";

// Public: sends a logged-in user to their landing page, anyone else to Login.
export default async function Home() {
  const actor = await currentActor();
  redirect(actor ? landingPathFor(actor) : LOGIN_PATH);
}
