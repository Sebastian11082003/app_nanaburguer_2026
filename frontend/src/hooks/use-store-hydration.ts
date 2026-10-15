"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/src/store/auth.store";

/**
 * True after the staff-auth persist store has rehydrated on the client.
 * Must not read `useAuthStore.persist` during SSR — that API is missing
 * on the server and Next falls back to a client error.
 */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistApi = useAuthStore.persist;
    if (!persistApi) {
      setHydrated(true);
      return;
    }
    if (persistApi.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return persistApi.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
