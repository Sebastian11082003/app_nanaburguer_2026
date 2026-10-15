"use client";

import { CashShiftPanel } from "@/src/components/cash/cash-shift-panel";

export default function AdminCashPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Caja</h1>
        <p className="text-zinc-400">
          Abrí el turno, registrá movimientos y cerrá con el cuadre del día
        </p>
      </div>
      <CashShiftPanel />
    </div>
  );
}
