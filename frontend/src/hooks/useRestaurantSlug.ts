"use client";

import { useRestaurantStore } from "@/src/store/restaurant.store";

export function useRestaurantSlug() {
  const restaurant = useRestaurantStore((state) => state.restaurant);

  return restaurant?.slug ?? "";
}
