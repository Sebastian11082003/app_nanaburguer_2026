"use client";

import { FloorBoard } from "@/src/components/pos/floor-board";
import { useAuthStore } from "@/src/store/auth.store";

export default function PosFloorPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-flame">
          Dashboard
        </p>
        <h1 className="mt-2 font-display text-4xl">Mesas</h1>
        <p className="mt-2 text-muted">
          Verde libre, rojo con cuenta. El rol {user?.role ?? ""} solo
          cambia qué puedes abrir, no el piso.
        </p>
      </div>
      <FloorBoard />
    </div>
  );
}
