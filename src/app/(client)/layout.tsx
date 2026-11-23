import { Shell } from "@/app/_components/shell/shell";
import { requireContact } from "@/modules/auth";

// Display only: the guard here reads the contact and client for the top bar. Every client page still calls requireContact() first.
export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireContact();
  return <Shell actor={actor}>{children}</Shell>;
}
