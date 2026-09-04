"use client";

import Link from "next/link";

import { CashMovementsPanel } from "@/src/components/cash/cash-movements-panel";

export default function CashierCashPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Caja</h1>
          <p className="text-zinc-400">
            Ingresos y egresos manuales. El cobro de órdenes está en Cobrar.
          </p>
        </div>
        <Link href="/restaurant/cashier" className="text-zinc-400 hover:text-white">
          ← Volver
        </Link>
      </div>
      <CashMovementsPanel />
    </main>
  );
}
