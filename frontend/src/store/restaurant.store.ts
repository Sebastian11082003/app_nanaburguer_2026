import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * The authenticated tenant (restaurant). After restaurant-login, restaurant
 * chrome must read this store (DEC-007). Platform screens (`/`, `/platform/*`)
 * must never use it for branding.
 */
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

interface State {
  restaurant: Restaurant | null;
  accessToken: string | null;
  setRestaurantAuth: (token: string, restaurant: Restaurant) => void;
  setTenantPreview: (restaurant: Restaurant) => void;
  logout: () => void;
}

export const useRestaurantStore = create<State>()(
  persist(
    (set) => ({
      restaurant: null,
      accessToken: null,

      setRestaurantAuth: (accessToken, restaurant) =>
        set({
          accessToken,
          restaurant,
        }),

      setTenantPreview: (restaurant) => set({ restaurant }),

      logout: () =>
        set({
          accessToken: null,
          restaurant: null,
        }),
    }),
    {
      name: "restaurant-auth",
    },
  ),
);
