"use client";

import { InvoiceList } from "@/src/components/invoices/invoice-list";
import { posReceiptHref } from "@/src/lib/invoice-href";

export default function CashierInvoicesPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-black sm:text-4xl">Recibos</h1>
        <p className="text-sm text-zinc-400 sm:text-base">
          Comprobantes del turno. Toca uno para verlo e imprimirlo.
        </p>
      </div>
      <InvoiceList
        itemHref={(id) => posReceiptHref(id, "/restaurant/cashier/invoices")}
      />
    </main>
  );
}
