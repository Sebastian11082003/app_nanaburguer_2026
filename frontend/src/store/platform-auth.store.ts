import { create } from "zustand";

import { persist } from "zustand/middleware";

import { PlatformAdmin } from "@/src/types/platform-auth";

interface PlatformAuthState {
  accessToken: string | null;

  admin: PlatformAdmin | null;

  isAuthenticated: boolean;

  setAuth: (token: string, admin: PlatformAdmin) => void;

  logout: () => void;
}

export const usePlatformAuthStore = create<PlatformAuthState>()(
  persist(
    (set) => ({
      accessToken: null,

      admin: null,

      isAuthenticated: false,

      setAuth: (token, admin) =>
        set({
          accessToken: token,
          admin,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          accessToken: null,
          admin: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "platform-auth",
    },
  ),
);
