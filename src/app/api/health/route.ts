import { checkDatabase } from "@/db/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const ok = await checkDatabase();
  return Response.json(
    { status: ok ? "ok" : "unavailable" },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
