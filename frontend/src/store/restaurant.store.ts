import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * The authenticated tenant (restaurant). `logoUrl` is per-tenant branding
 * — it must ONLY be rendered on screens that are already inside this
 * tenant's context (post restaurant-login). Platform-level screens
 * (`/`, `/platform/*`, the pre-login `/restaurant/login` gate) must never
 * read from this store for branding, since no tenant is resolved yet.
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
