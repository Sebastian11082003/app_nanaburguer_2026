import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  clearAuthCookie,
  setAuthCookie,
  STAFF_TOKEN_COOKIE,
} from "@/src/lib/auth-cookies";
import { AuthUser } from "../types/auth";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          setAuthCookie(STAFF_TOKEN_COOKIE, token);
        }

        set({
          accessToken: token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          clearAuthCookie(STAFF_TOKEN_COOKIE);
        }

        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "staff-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          localStorage.setItem("token", state.accessToken);
          setAuthCookie(STAFF_TOKEN_COOKIE, state.accessToken);
        }
      },
    },
  ),
);
