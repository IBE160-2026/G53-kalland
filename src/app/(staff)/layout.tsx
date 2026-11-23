import { Shell } from "@/app/_components/shell/shell";
import { requireStaff } from "@/modules/auth";

// Display only: the guard here reads the user for the top bar. Every staff page still calls requireStaff() first.
export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireStaff();
  return <Shell actor={actor}>{children}</Shell>;
}
