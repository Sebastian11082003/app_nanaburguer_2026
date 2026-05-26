import axios from "axios";

import { useAuthStore } from "../store/auth.store";

import { usePlatformAuthStore } from "../store/platform-auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const restaurantToken = useAuthStore.getState().accessToken;

  const platformToken = usePlatformAuthStore.getState().accessToken;

  const token = platformToken || restaurantToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
