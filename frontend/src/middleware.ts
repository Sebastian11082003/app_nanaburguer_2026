import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware cannot read Zustand/localStorage.
 * Soft protection: redirect unauthenticated browser navigations
 * when the staff token cookie is missing.
 * Cookie is set by auth store on login (see auth.store + login pages).
 */
const STATION_ROOTS = [
  "/restaurant/admin",
  "/restaurant/cashier",
  "/restaurant/waiter",
  "/restaurant/kitchen",
  "/restaurant/delivery",
] as const;

function stationRootOf(pathname: string): string | null {
  return (
    STATION_ROOTS.find(
      (root) => pathname === root || pathname.startsWith(`${root}/`),
    ) ?? null
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const staffToken = request.cookies.get("nb_staff_token")?.value;
  const platformToken = request.cookies.get("nb_platform_token")?.value;

  const stationRoot = stationRootOf(pathname);
  const isStationLogin = Boolean(stationRoot && pathname === `${stationRoot}/login`);
  const isStaffProtected = Boolean(stationRoot && !isStationLogin);

  const isPlatformProtected =
    pathname.startsWith("/platform") &&
    !pathname.startsWith("/platform/login");

  if (isStaffProtected && !staffToken) {
    return NextResponse.redirect(new URL(`${stationRoot}/login`, request.url));
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
    "/restaurant/cashier",
    "/restaurant/cashier/:path*",
    "/restaurant/waiter",
    "/restaurant/waiter/:path*",
    "/restaurant/kitchen",
    "/restaurant/kitchen/:path*",
    "/restaurant/delivery",
    "/restaurant/delivery/:path*",
    "/platform/:path*",
  ],
};
