"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ReportRangeBar } from "@/src/components/reports/report-range-bar";
import { StatCard } from "@/src/components/reports/stat-card";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { paymentMethodLabel } from "@/src/lib/payment-method-label";
import { defaultReportRange, ReportRange } from "@/src/lib/report-range";
import {
  PaymentMethodBreakdown,
  ReportsSummary,
  reportsService,
} from "@/src/services/reports.service";

const LINKS = [
  {
    href: "/restaurant/admin/reports/sales",
    title: "Ventas por día",
    description: "Ingresos cobrados agrupados por fecha",
  },
  {
    href: "/restaurant/admin/reports/products",
    title: "Productos",
    description: "Top 10 por cantidad vendida",
  },
  {
    href: "/restaurant/admin/reports/deliveries",
    title: "Domicilios y pickup",
    description: "Volumen y mix de pago por canal",
  },
  {
    href: "/restaurant/admin/reports/status",
    title: "Órdenes por estado",
    description: "Cuello de botella operativo",
  },
];

export default function ReportsPage() {
  const [range, setRange] = useState<ReportRange>(defaultReportRange);
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [methods, setMethods] = useState<PaymentMethodBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [nextSummary, nextMethods] = await Promise.all([
          reportsService.summary(range),
          reportsService.paymentMethods(range),
        ]);
        setSummary(nextSummary);
        setMethods(nextMethods);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudieron cargar los reportes"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [range]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Reportes</h1>
        <p className="text-zinc-400">
          Ventas cobradas en el rango (UTC). No incluye órdenes abiertas.
        </p>
      </div>

      <ReportRangeBar value={range} onChange={setRange} />

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Ingresos"
                value={formatCents(summary.totalRevenue)}
              />
              <StatCard label="Ventas" value={String(summary.totalSales)} />
              <StatCard
                label="Órdenes"
                value={String(summary.totalOrders)}
              />
            </div>
          )}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
            <p className="font-bold">Cuadre por medio de pago</p>
            {methods.length === 0 ? (
              <p className="mt-2 text-zinc-400">Aún no hay pagos</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {methods.map((row) => (
                  <li
                    key={row.method}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-zinc-400">
                      {paymentMethodLabel(row.method)} ({row.count})
                    </span>
                    <span className="font-bold">{formatCents(row.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 transition hover:border-white/40"
              >
                <p className="font-bold">{link.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{link.description}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
