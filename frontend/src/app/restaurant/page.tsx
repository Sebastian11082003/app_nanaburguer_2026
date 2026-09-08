"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useHydratedRestaurant } from "@/src/hooks/use-hydrated-restaurant";

/**
 * Restaurant-first gate: identify the local (slug), then staff login
 * shows that restaurant. Direct staff login still works if a session exists.
 */
export default function RestaurantIndexPage() {
  const router = useRouter();
  const { restaurant, ready } = useHydratedRestaurant();

  useEffect(() => {
    if (!ready) return;
    router.replace(restaurant ? "/restaurant/login" : "/restaurant/local-login");
  }, [ready, restaurant, router]);

  return <main className="p-8 text-muted">Cargando...</main>;
}
