import { requireEnv } from "@/db/client";
import { Forbidden } from "@/modules/shared/errors";

// CSRF protection for Route Handlers (AD-4): a state-changing request must carry an Origin header equal
// to APP_ORIGIN. A missing Origin is refused too.
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(requireEnv("APP_ORIGIN")).origin) throw new Forbidden();
}
