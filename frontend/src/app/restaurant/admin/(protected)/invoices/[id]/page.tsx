"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { resolveAssetUrl } from "@/src/lib/resolve-asset-url";
import {
  Invoice,
  InvoicePrintData,
  invoicesService,
} from "@/src/services/invoices.service";

/**
 * Receipt-style view of a single invoice, built from its frozen
 * `responseJson` snapshot (via `GET /invoices/:id/print`) rather than the
 * live order/menu data — so it always shows exactly what the customer was
 * charged, even if the menu item was later renamed or the restaurant's
 * info changed.
 */
export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [receipt, setReceipt] = useState<InvoicePrintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [invoiceData, printData] = await Promise.all([
        invoicesService.getById(invoiceId),
        invoicesService.print(invoiceId),
      ]);
      setInvoice(invoiceData);
      // Old invoices created before the snapshot existed fall back to a
      // plain `{ message, invoice }` payload — guard against that shape.
      setReceipt("items" in printData ? printData : null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cargar la factura"));
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    load();
  }, [load]);

  /** Simulated DIAN acceptance — assigns a CUFE and flips status to ACCEPTED. */
  async function handleAccept() {
    try {
      setBusy(true);
      setError("");
      await invoicesService.accept(invoiceId);
      setMessage("Factura marcada como aceptada");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo aceptar la factura"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p>Cargando factura...</p>;
  }

  if (!invoice) {
    return <p className="text-red-500">{error || "Factura no encontrada"}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-3xl font-black">{invoice.number}</h1>
          <p className="text-zinc-400">
            {invoice.status === "ACCEPTED"
              ? `Aceptada · CUFE ${invoice.cufe}`
              : invoice.status === "REJECTED"
                ? "Rechazada"
                : "Pendiente"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-900"
          >
            Imprimir
          </button>
          <Link
            href="/restaurant/admin/invoices"
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← Volver
          </Link>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      {receipt ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 print:border-none print:bg-white print:text-black">
          <div className="text-center">
            {/*
              Plain <img>, not next/image: this is a frozen receipt meant
              to print reliably, and Next's lazy-loading/srcset behavior
              is unnecessary friction for a small masthead logo here.
            */}
            {receipt.restaurant.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveAssetUrl(receipt.restaurant.logoUrl)}
                alt={receipt.restaurant.name}
                className="mx-auto mb-3 h-16 w-16 rounded-2xl border border-zinc-800 object-cover print:border-zinc-300"
              />
            )}
            <h2 className="text-xl font-bold">{receipt.restaurant.name}</h2>
            <p className="text-sm text-zinc-400 print:text-zinc-600">
              NIT {receipt.restaurant.nit}
              {receipt.restaurant.address ? ` · ${receipt.restaurant.address}` : ""}
            </p>
          </div>

          <div className="mt-4 flex justify-between text-sm text-zinc-400 print:text-zinc-600">
            <span>{receipt.invoice.number}</span>
            <span>{new Date(receipt.invoice.date).toLocaleString()}</span>
          </div>

          <p className="mt-2 text-sm text-zinc-400 print:text-zinc-600">
            Orden #{receipt.order.number} · {receipt.order.type}
            {receipt.order.table ? ` · Mesa ${receipt.order.table}` : ""}
          </p>

          {receipt.delivery && (
            <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">
              Cliente: {receipt.delivery.customerName} · {receipt.delivery.phone}
            </p>
          )}

          <ul className="mt-4 space-y-2 border-t border-zinc-800 pt-4 text-sm print:border-zinc-300">
            {receipt.items.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatCents(item.total)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-zinc-800 pt-4 text-sm print:border-zinc-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCents(receipt.totals.subtotal)}</span>
            </div>
            {(receipt.totals.discount ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Descuento</span>
                <span>-{formatCents(receipt.totals.discount ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Propina</span>
              <span>{formatCents(receipt.totals.tip)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatCents(receipt.totals.total)}</span>
            </div>
          </div>

          <div className="mt-4 text-sm text-zinc-400 print:text-zinc-600">
            <p>
              Pago: {receipt.payment.methodLabel ?? receipt.payment.method}
              {receipt.payment.received != null
                ? ` · Recibido ${formatCents(receipt.payment.received)} · Cambio ${formatCents(receipt.payment.change)}`
                : ""}
            </p>
          </div>

          <p className="mt-4 text-xs text-zinc-500 print:text-zinc-500">
            {receipt.legal.tipDisclaimer}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-zinc-400">
            Esta factura no tiene un comprobante detallado guardado.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Total: {formatCents(invoice.totalCents)}
          </p>
        </div>
      )}

      {invoice.status === "PENDING" && (
        <button
          type="button"
          disabled={busy}
          onClick={handleAccept}
          className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black disabled:opacity-50 print:hidden"
        >
          {busy ? "Procesando..." : "Marcar como aceptada (simulación DIAN)"}
        </button>
      )}
    </div>
  );
}
