"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PosShell } from "@/src/components/pos/pos-shell";
import { useHydratedRestaurant } from "@/src/hooks/use-hydrated-restaurant";
import { useAuthStore } from "@/src/store/auth.store";
import { UserRole } from "@/src/types/auth";

type Station = "floor" | "cashier" | "waiter" | "delivery";

const ALLOW: Record<Station, UserRole[]> = {
  floor: ["ADMIN", "CASHIER", "WAITER", "DELIVERY"],
  cashier: ["ADMIN", "CASHIER"],
  waiter: ["ADMIN", "CASHIER", "WAITER"],
  delivery: ["ADMIN", "CASHIER", "DELIVERY"],
};

/**
 * Same POS chrome as the floor. Station only decides who may open the route.
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
    const current = user?.role;
    if (current && !ALLOW[station].includes(current)) {
      router.replace(
        current === "KITCHEN" ? "/restaurant/kitchen" : "/restaurant/app",
      );
    }
  }, [router, isAuthenticated, role, station]);

  if (!ready || !tenantReady) {
    return <main className="p-8 text-muted">Cargando...</main>;
  }

  return <PosShell>{children}</PosShell>;
}
