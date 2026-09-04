"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StatCard } from "@/src/components/reports/stat-card";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { paymentMethodLabel } from "@/src/lib/payment-method-label";
import {
  DashboardSnapshot,
  reportsService,
} from "@/src/services/reports.service";

/** Admin home: live snapshot from GET /reports/dashboard. */
export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setData(await reportsService.dashboard());
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudo cargar el dashboard"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Dashboard</h1>
        <p className="text-zinc-400">
          Ventas del día, semana y mes a partir de las ventas cobradas
        </p>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Ventas hoy"
              value={formatCents(data.salesToday)}
            />
            <StatCard
              label="Ventas 7 días"
              value={formatCents(data.salesWeek)}
            />
            <StatCard
              label="Ventas del mes"
              value={formatCents(data.salesMonth)}
            />
            <StatCard
              label="Órdenes (históricas)"
              value={String(data.totalOrders)}
            />
            <StatCard
              label="Mesas activas"
              value={String(data.activeTables)}
            />
            <StatCard
              label="Domicilios hoy"
              value={String(data.deliveriesToday)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
              <p className="font-bold">Por método de pago</p>
              {data.paymentMethods.length === 0 ? (
                <p className="mt-2 text-zinc-400">Aún no hay pagos</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {data.paymentMethods.map((row) => (
                    <li
                      key={row.method}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-zinc-400">
                        {paymentMethodLabel(row.method)} ({row.count})
                      </span>
                      <span className="font-bold">
                        {formatCents(row.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
              <p className="font-bold">Producto más vendido</p>
              {data.topProduct ? (
                <p className="mt-2">
                  {data.topProduct.name}{" "}
                  <span className="text-zinc-400">
                    · {data.topProduct.quantity} uds
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-zinc-400">Aún no hay ítems vendidos</p>
              )}
              <Link
                href="/restaurant/admin/reports"
                className="mt-4 inline-block text-sm text-zinc-400 hover:text-white"
              >
                Ver reportes →
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
