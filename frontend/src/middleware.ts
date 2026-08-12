import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware cannot read Zustand/localStorage.
 * Soft protection: redirect unauthenticated browser navigations
 * when the staff token cookie is missing.
 * Cookie is set by auth store on login (see auth.store + login pages).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const staffToken = request.cookies.get("nb_staff_token")?.value;
  const platformToken = request.cookies.get("nb_platform_token")?.value;

  const isStaffProtected =
    pathname.startsWith("/restaurant/admin") &&
    !pathname.startsWith("/restaurant/admin/login");

  const isPlatformProtected =
    pathname.startsWith("/platform") &&
    !pathname.startsWith("/platform/login");

  if (isStaffProtected && !staffToken) {
    return NextResponse.redirect(
      new URL("/restaurant/admin/login", request.url),
    );
  }

  if (isPlatformProtected && !platformToken) {
    return NextResponse.redirect(new URL("/platform/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/restaurant/admin/:path*", "/platform/:path*"],
};
