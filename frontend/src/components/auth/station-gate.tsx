"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { useStoreHydration } from "@/src/hooks/use-store-hydration";
import { isStationLoginPath, STATION_BY_ROLE } from "@/src/lib/stations";
import { useAuthStore } from "@/src/store/auth.store";
import { UserRole } from "@/src/types/auth";

/**
 * Client guard for a station workspace. Middleware only sees the cookie;
 * this also sends the wrong role back to their own hub.
 * ADMIN may open any station (same as API @Roles on most ops).
 */
export function StationGate({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useStoreHydration(useAuthStore.persist);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const station = STATION_BY_ROLE[role];

  useEffect(() => {
    if (!hydrated || isStationLoginPath(pathname)) return;

    if (!isAuthenticated || !user) {
      router.replace(station.loginHref);
      return;
    }

    if (user.role !== role && user.role !== "ADMIN") {
      router.replace(STATION_BY_ROLE[user.role]?.homeHref ?? "/restaurant/roles");
    }
  }, [
    hydrated,
    isAuthenticated,
    user,
    role,
    router,
    station.loginHref,
    pathname,
  ]);

  if (isStationLoginPath(pathname)) {
    return children;
  }

  if (!hydrated) {
    return <main className="p-8 text-muted">Cargando estación...</main>;
  }

  if (!isAuthenticated || !user) {
    return <main className="p-8 text-muted">Redirigiendo al login...</main>;
  }

  if (user.role !== role && user.role !== "ADMIN") {
    return <main className="p-8 text-muted">Redirigiendo a tu estación...</main>;
  }

  return children;
}
