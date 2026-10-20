import axios from "axios";

import { shouldExpireStaffSession } from "@/src/lib/staff-auth-expired";
import { logoutStaffKeepLocal } from "@/src/lib/staff-session";
import { useAuthStore } from "@/src/store/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const storeToken = useAuthStore.getState().accessToken;

  const localToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const token = storeToken || localToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: { response?: { status?: number }; config?: { url?: string } }) => {
    if (
      typeof window !== "undefined" &&
      shouldExpireStaffSession(error?.response?.status, error?.config?.url)
    ) {
      logoutStaffKeepLocal();
      if (!window.location.pathname.startsWith("/restaurant/login")) {
        window.location.assign("/restaurant/login");
      }
    }
    return Promise.reject(error);
  },
);
