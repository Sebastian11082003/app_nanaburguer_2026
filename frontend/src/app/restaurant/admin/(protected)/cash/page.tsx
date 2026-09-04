"use client";

import { CashMovementsPanel } from "@/src/components/cash/cash-movements-panel";

export default function AdminCashPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Caja</h1>
        <p className="text-zinc-400">
          Ingresos y egresos manuales del restaurante (no es el cobro de
          órdenes)
        </p>
      </div>
      <CashMovementsPanel />
    </div>
  );
}
