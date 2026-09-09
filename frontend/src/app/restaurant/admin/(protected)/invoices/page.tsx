"use client";

import { InvoiceList } from "@/src/components/invoices/invoice-list";
import { adminReceiptHref } from "@/src/lib/invoice-href";

/** Admin's list of every invoice generated at payment time. */
export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Facturas</h1>
        <p className="text-zinc-400">
          Comprobantes generados automáticamente al registrar un pago
        </p>
      </div>
      <InvoiceList itemHref={(id) => adminReceiptHref(id)} />
    </div>
  );
}
