"use client";

import Link from "next/link";

import { CashShiftPanel } from "@/src/components/cash/cash-shift-panel";

export default function CashierCashPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-black sm:text-4xl">Caja</h1>
          <p className="text-sm text-zinc-400 sm:text-base">
            Abre el turno, registra movimientos y cierra el cuadre. El cobro
            de órdenes está en la mesa o en Ventas.
          </p>
        </div>
        <Link
          href="/restaurant/app"
          className="inline-flex min-h-11 items-center text-zinc-400 hover:text-white"
        >
          ← Mesas
        </Link>
      </div>
      <CashShiftPanel />
    </main>
  );
}
