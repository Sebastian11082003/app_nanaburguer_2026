"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { reportsService, SalesByDay } from "@/src/services/reports.service";

export default function SalesReportPage() {
  const [rows, setRows] = useState<SalesByDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setRows(await reportsService.salesByDay());
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudieron cargar las ventas"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/restaurant/admin/reports"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Reportes
        </Link>
        <h1 className="mt-2 text-4xl font-black">Ventas por día</h1>
        <p className="text-zinc-400">Ingresos cobrados agrupados por fecha</p>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.date}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4"
            >
              <p className="font-bold">{row.date}</p>
              <p>{formatCents(row.total)}</p>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-zinc-400">Aún no hay ventas cobradas</p>
          )}
        </div>
      )}
    </div>
  );
}
