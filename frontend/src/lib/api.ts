import axios from "axios";

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
