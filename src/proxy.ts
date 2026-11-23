import { NextResponse, type NextRequest } from "next/server";
// Imported directly (not through the auth index) to keep pg and argon2 out of the proxy bundle.
import { REQUEST_PATH_HEADER } from "@/modules/auth/request-path";

// Passes the request's path and query on to the guards, which build the Login return-to from it.
// Display only: this is not a guard, and every page still calls requireStaff()/requireContact() (AD-5).
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_PATH_HEADER, `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

// The upload route, exactly /api/images/<id>/file, is left out: a proxy caps request bodies at
// 10 MB, and uploads may be 50 MB.
// Its guard needs no return-to, since a Route Handler is never a page to come back to.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|api/images/[^/]+/file$).*)"],
};
