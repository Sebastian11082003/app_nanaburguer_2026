"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { Invoice, invoicesService } from "@/src/services/invoices.service";

const STATUS_LABEL: Record<Invoice["status"], string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
};

/**
 * Same invoice list for admin Facturas and caja Recibos. Only the
 * detail href changes so caja stays in the POS chrome.
 */
export function InvoiceList({
  itemHref,
}: {
  itemHref: (id: string) => string;
}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setInvoices(await invoicesService.getAll());
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudieron cargar las facturas"));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (loading) return <p>Cargando...</p>;

  return (
    <div className="space-y-2">
      {invoices.map((invoice) => (
        <Link
          key={invoice.id}
          href={itemHref(invoice.id)}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 transition hover:border-white/40"
        >
          <div>
            <p className="font-bold">{invoice.number}</p>
            <p className="text-sm text-zinc-500">
              {new Date(invoice.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">{formatCents(invoice.totalCents)}</p>
            <p className="text-sm text-zinc-500">
              {STATUS_LABEL[invoice.status]}
            </p>
          </div>
        </Link>
      ))}

      {invoices.length === 0 && (
        <p className="text-zinc-400">Aún no se han generado facturas</p>
      )}
    </div>
  );
}
