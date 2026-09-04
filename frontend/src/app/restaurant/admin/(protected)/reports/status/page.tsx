"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ReportRangeBar } from "@/src/components/reports/report-range-bar";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { orderStatusLabel } from "@/src/lib/order-status-label";
import { defaultReportRange, ReportRange } from "@/src/lib/report-range";
import {
  OrdersByStatus,
  reportsService,
} from "@/src/services/reports.service";

export default function OrdersByStatusPage() {
  const [range, setRange] = useState<ReportRange>(defaultReportRange);
  const [rows, setRows] = useState<OrdersByStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        setRows(await reportsService.ordersByStatus(range));
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudieron cargar los estados"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [range]);

  const total = rows.reduce((acc, row) => acc + row.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/restaurant/admin/reports"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Reportes
        </Link>
        <h1 className="mt-2 text-4xl font-black">Órdenes por estado</h1>
        <p className="text-zinc-400">
          Órdenes creadas en el rango, agrupadas por estado actual
        </p>
      </div>

      <ReportRangeBar value={range} onChange={setRange} />

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.status}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4"
            >
              <p className="font-bold">{orderStatusLabel(row.status)}</p>
              <p className="text-zinc-400">
                {row.count}
                {total > 0
                  ? ` · ${Math.round((row.count / total) * 100)}%`
                  : ""}
              </p>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-zinc-400">Aún no hay órdenes en el rango</p>
          )}
        </div>
      )}
    </div>
  );
}
