"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StatCard } from "@/src/components/reports/stat-card";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import {
  DeliveryReportsSummary,
  reportsService,
} from "@/src/services/reports.service";

export default function DeliveriesReportPage() {
  const [data, setData] = useState<DeliveryReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setData(await reportsService.deliverySummary());
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudo cargar el reporte"));
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
        <h1 className="mt-2 text-4xl font-black">Domicilios</h1>
        <p className="text-zinc-400">
          Pedidos delivery y mix de pago declarado en el domicilio
        </p>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              label="Domicilios"
              value={String(data.totalDeliveries)}
            />
            <StatCard
              label="Ingresos (venta asociada)"
              value={formatCents(data.totalRevenue)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Efectivo" value={String(data.payments.cash)} />
            <StatCard label="Tarjeta" value={String(data.payments.card)} />
            <StatCard
              label="Transferencia"
              value={String(data.payments.transfer)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
