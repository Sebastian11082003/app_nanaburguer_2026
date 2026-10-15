"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PosShell } from "@/src/components/pos/pos-shell";
import { useHydratedRestaurant } from "@/src/hooks/use-hydrated-restaurant";
import { canAccessPosStation } from "@/src/lib/pos-nav";
import { homeForRole } from "@/src/services/user-auth.service";
import { useAuthStore } from "@/src/store/auth.store";

type Station = "floor" | "cashier" | "waiter" | "delivery";

/**
 * Same POS chrome as the floor. Station decides who may open the route:
 * role default plus extra permissions (HU-032). Riders never land on Mesas.
 */
export function StaffPosLayout({
  children,
  station,
}: {
  children: ReactNode;
  station: Station;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const { ready: tenantReady } = useHydratedRestaurant();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const user = useAuthStore.getState().user;
    if (!useAuthStore.getState().isAuthenticated) {
      router.replace("/restaurant/login");
      return;
    }
    if (!user?.role) return;
    if (!canAccessPosStation(user, station)) {
      router.replace(homeForRole(user.role));
    }
  }, [router, isAuthenticated, role, station]);

  if (!ready || !tenantReady) {
    return <main className="p-8 text-muted">Cargando...</main>;
  }

  return <PosShell>{children}</PosShell>;
}
