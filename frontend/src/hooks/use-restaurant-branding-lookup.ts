"use client";

import { useEffect, useRef, useState } from "react";

import {
  RestaurantBranding,
  restaurantAuthService,
} from "@/src/services/restaurant-auth.service";

const BRANDING_LOOKUP_DEBOUNCE_MS = 400;

export type BrandingLookupStatus = "idle" | "loading" | "found" | "missing";

/**
 * Public slug → name/logo. Empty slug stays platform-branded; a match
 * is the only moment tenant chrome may appear on pre-login screens.
 */
export function useRestaurantBrandingLookup(slug: string): {
  branding: RestaurantBranding | null;
  status: BrandingLookupStatus;
} {
  const [branding, setBranding] = useState<RestaurantBranding | null>(null);
  const [status, setStatus] = useState<BrandingLookupStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const normalized = slug.trim().toLowerCase();

    if (!normalized) {
      setBranding(null);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    debounceRef.current = setTimeout(() => {
      restaurantAuthService
        .getBranding(normalized)
        .then((result) => {
          setBranding(
            result
              ? { ...result, slug: result.slug ?? normalized }
              : null,
          );
          setStatus(result ? "found" : "missing");
        })
        .catch(() => {
          setBranding(null);
          setStatus("missing");
        });
    }, BRANDING_LOOKUP_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [slug]);

  return { branding, status };
}
