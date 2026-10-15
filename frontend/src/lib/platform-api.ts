import axios from "axios";

import { usePlatformAuthStore } from "@/src/store/platform-auth.store";

export const platformApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

platformApi.interceptors.request.use((config) => {
  const token = usePlatformAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
