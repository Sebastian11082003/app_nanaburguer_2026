import { create } from "zustand";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface State {
  restaurant: Restaurant | null;
  accessToken: string | null;

  setRestaurantAuth: (token: string, restaurant: Restaurant) => void;

  logout: () => void;
}

export const useRestaurantStore = create<State>((set) => ({
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
}));
