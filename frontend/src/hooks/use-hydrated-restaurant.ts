"use client";

import { useEffect, useState } from "react";

import { restaurantAuthService } from "@/src/services/restaurant-auth.service";
import { useRestaurantStore } from "@/src/store/restaurant.store";

/**
 * Wait for persist, then refresh name/logo from the API. Persist can be
 * stale (logo uploaded later); the monogram must not replace a real logo.
 */
export function useHydratedRestaurant() {
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const persist = useRestaurantStore.persist;
    const start = persist.hasHydrated()
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          persist.onFinishHydration(() => resolve());
        });

    let cancelled = false;

    void start.then(async () => {
      const current = useRestaurantStore.getState().restaurant;
      if (!current?.slug) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        const branding = await restaurantAuthService.getBranding(current.slug);
        if (cancelled || !branding) return;
        const latest = useRestaurantStore.getState().restaurant;
        if (!latest || latest.slug !== current.slug) return;
        if (
          branding.logoUrl !== latest.logoUrl ||
          branding.name !== latest.name
        ) {
          useRestaurantStore.getState().setTenantPreview({
            ...latest,
            name: branding.name,
            logoUrl: branding.logoUrl,
          });
        }
      } catch {
        // Keep persist values if branding is unreachable.
      } finally {
        if (!cancelled) setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [restaurant?.slug]);

  return { restaurant, ready };
}
