import axios from "axios";

import { useAuthStore } from "@/src/store/auth.store";

export const restaurantApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

restaurantApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // The instance default forces JSON, but file uploads (logo, etc) send
  // a `FormData` body — the browser must set its own `multipart/form-data;
  // boundary=...` header for those, or the server can't parse the body.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});
