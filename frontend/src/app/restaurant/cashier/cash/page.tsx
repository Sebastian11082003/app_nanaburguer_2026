"use client";

import Link from "next/link";

import { CashShiftPanel } from "@/src/components/cash/cash-shift-panel";

export default function CashierCashPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Caja</h1>
          <p className="text-zinc-400">
            Abrí el turno, registrá movimientos y cerrá el cuadre. El cobro
            de órdenes sigue en Cobrar.
          </p>
        </div>
        <Link href="/restaurant/cashier" className="text-zinc-400 hover:text-white">
          ← Volver
        </Link>
      </div>
      <CashShiftPanel />
    </main>
  );
}
