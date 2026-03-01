import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_ROUTE = "/admin-login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === LOGIN_ROUTE) {
    return NextResponse.next();
  }

  const VALID_ROOTS = ["/", "/projects", "/api"];
  const isKnownRoute = VALID_ROOTS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isKnownRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|admin-login).*)"],
};
