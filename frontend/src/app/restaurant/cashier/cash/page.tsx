"use client";

import Link from "next/link";

import { CashMovementsPanel } from "@/src/components/cash/cash-movements-panel";

export default function CashierCashPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-black sm:text-4xl">Caja</h1>
          <p className="text-sm text-zinc-400 sm:text-base">
            Ingresos y egresos manuales. El cobro de órdenes está en Cobrar.
          </p>
        </div>
        <Link
          href="/restaurant/app"
          className="inline-flex min-h-11 items-center text-zinc-400 hover:text-white"
        >
          ← Mesas
        </Link>
      </div>
      <CashMovementsPanel />
    </main>
  );
}
