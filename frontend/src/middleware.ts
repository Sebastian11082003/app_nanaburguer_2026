import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Cookie-only gate. Role filtering happens in the POS nav after login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const staffToken = request.cookies.get("nb_staff_token")?.value;
  const platformToken = request.cookies.get("nb_platform_token")?.value;

  const isStaffProtected =
    (pathname.startsWith("/restaurant/admin") &&
      !pathname.startsWith("/restaurant/admin/login")) ||
    pathname === "/restaurant/app" ||
    pathname.startsWith("/restaurant/app/") ||
    (pathname.startsWith("/restaurant/cashier") &&
      !pathname.startsWith("/restaurant/cashier/login")) ||
    (pathname.startsWith("/restaurant/waiter") &&
      !pathname.startsWith("/restaurant/waiter/login")) ||
    (pathname.startsWith("/restaurant/delivery") &&
      !pathname.startsWith("/restaurant/delivery/login")) ||
    (pathname.startsWith("/restaurant/kitchen") &&
      !pathname.startsWith("/restaurant/kitchen/login"));

  const isPlatformProtected =
    pathname.startsWith("/platform") &&
    !pathname.startsWith("/platform/login");

  if (isStaffProtected && !staffToken) {
    return NextResponse.redirect(new URL("/restaurant/login", request.url));
  }

  if (isPlatformProtected && !platformToken) {
    return NextResponse.redirect(new URL("/platform/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/restaurant/admin",
    "/restaurant/admin/:path*",
    "/restaurant/app",
    "/restaurant/app/:path*",
    "/restaurant/cashier",
    "/restaurant/cashier/:path*",
    "/restaurant/waiter",
    "/restaurant/waiter/:path*",
    "/restaurant/delivery",
    "/restaurant/delivery/:path*",
    "/restaurant/kitchen",
    "/restaurant/kitchen/:path*",
    "/platform/:path*",
  ],
};
