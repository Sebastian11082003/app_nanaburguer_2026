import { create } from "zustand";

import { AuthUser } from "../types/auth";

interface AuthState {
  accessToken: string | null;

  user: AuthUser | null;

  isAuthenticated: boolean;

  setAuth: (token: string, user: AuthUser) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,

  user: null,

  isAuthenticated: false,

  setAuth: (token, user) =>
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    }),
}));
