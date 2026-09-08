"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PosShell } from "@/src/components/pos/pos-shell";
import { useAuthStore } from "@/src/store/auth.store";

export default function PosAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (!useAuthStore.getState().isAuthenticated) {
      router.replace("/restaurant/login");
    }
  }, [router, isAuthenticated]);

  if (!ready) {
    return <main className="p-8 text-muted">Cargando...</main>;
  }

  return <PosShell>{children}</PosShell>;
}
