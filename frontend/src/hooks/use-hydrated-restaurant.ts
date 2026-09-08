"use client";

import { useEffect, useState } from "react";

import { useRestaurantStore } from "@/src/store/restaurant.store";

/**
 * Restaurant persist is async. Staff screens wait so the slug/name
 * from the restaurant session are not dropped on first paint.
 */
export function useHydratedRestaurant() {
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const [ready, setReady] = useState(() =>
    useRestaurantStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const persist = useRestaurantStore.persist;
    if (persist.hasHydrated()) {
      setReady(true);
      return;
    }
    return persist.onFinishHydration(() => setReady(true));
  }, []);

  return { restaurant, ready };
}
