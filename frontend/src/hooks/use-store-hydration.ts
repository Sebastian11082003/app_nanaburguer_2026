"use client";

import { useEffect, useState } from "react";

type PersistApi = {
  hasHydrated: () => boolean;
  onFinishHydration: (callback: () => void) => () => void;
};

/** Wait for a zustand `persist` store before reading auth from it. */
export function useStoreHydration(persistApi: PersistApi): boolean {
  const [hydrated, setHydrated] = useState(persistApi.hasHydrated());

  useEffect(() => {
    const unsub = persistApi.onFinishHydration(() => setHydrated(true));
    if (persistApi.hasHydrated()) setHydrated(true);
    return unsub;
  }, [persistApi]);

  return hydrated;
}
