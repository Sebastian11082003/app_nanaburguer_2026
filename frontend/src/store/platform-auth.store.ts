import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  clearAuthCookie,
  PLATFORM_TOKEN_COOKIE,
  setAuthCookie,
} from "@/src/lib/auth-cookies";
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

      setAuth: (token, admin) => {
        setAuthCookie(PLATFORM_TOKEN_COOKIE, token);

        set({
          accessToken: token,
          admin,
          isAuthenticated: true,
        });
      },

      logout: () => {
        clearAuthCookie(PLATFORM_TOKEN_COOKIE);

        set({
          accessToken: null,
          admin: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "platform-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAuthCookie(PLATFORM_TOKEN_COOKIE, state.accessToken);
        }
      },
    },
  ),
);
