"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { reportsService, TopProduct } from "@/src/services/reports.service";

export default function ProductsReportPage() {
  const [rows, setRows] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setRows(await reportsService.topProducts());
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudieron cargar los productos"));
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
        <h1 className="mt-2 text-4xl font-black">Productos</h1>
        <p className="text-zinc-400">Top 10 por cantidad en ítems de orden</p>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div
              key={row.menuItemId}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4"
            >
              <p className="font-bold">
                {index + 1}. {row.name}
              </p>
              <p className="text-zinc-400">{row.quantity} uds</p>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-zinc-400">Aún no hay ítems vendidos</p>
          )}
        </div>
      )}
    </div>
  );
}
