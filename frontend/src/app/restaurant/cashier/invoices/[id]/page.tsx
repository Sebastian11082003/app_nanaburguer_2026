"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { InvoiceReceiptView } from "@/src/components/invoices/invoice-receipt-view";

function CashierInvoiceInner() {
  const params = useParams<{ id: string }>();
  const from = useSearchParams().get("from");

  return (
    <main className="mx-auto max-w-5xl overflow-x-hidden">
      <InvoiceReceiptView
        invoiceId={params.id}
        backHref={from || "/restaurant/cashier/invoices"}
      />
    </main>
  );
}

export default function CashierInvoicePage() {
  return (
    <Suspense fallback={<p>Cargando recibo...</p>}>
      <CashierInvoiceInner />
    </Suspense>
  );
}
