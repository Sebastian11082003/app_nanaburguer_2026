"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { InvoiceReceiptView } from "@/src/components/invoices/invoice-receipt-view";

function InvoiceDetailInner() {
  const params = useParams<{ id: string }>();
  const from = useSearchParams().get("from");

  return (
    <InvoiceReceiptView
      invoiceId={params.id}
      backHref={from || "/restaurant/admin/invoices"}
      showAccept
    />
  );
}

export default function InvoiceDetailPage() {
  return (
    <Suspense fallback={<p>Cargando factura...</p>}>
      <InvoiceDetailInner />
    </Suspense>
  );
}
