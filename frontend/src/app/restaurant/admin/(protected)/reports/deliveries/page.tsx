"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ReportRangeBar } from "@/src/components/reports/report-range-bar";
import { StatCard } from "@/src/components/reports/stat-card";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { defaultReportRange, ReportRange } from "@/src/lib/report-range";
import {
  DeliveryReportsSummary,
  reportsService,
} from "@/src/services/reports.service";

export default function DeliveriesReportPage() {
  const [range, setRange] = useState<ReportRange>(defaultReportRange);
  const [data, setData] = useState<DeliveryReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        setData(await reportsService.deliverySummary(range));
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudo cargar el reporte"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [range]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/restaurant/admin/reports"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Reportes
        </Link>
        <h1 className="mt-2 text-4xl font-black">Domicilios y pickup</h1>
        <p className="text-zinc-400">
          Canales separados. El mix de pago es el declarado en el domicilio.
        </p>
      </div>

      <ReportRangeBar value={range} onChange={setRange} />

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              label="Domicilios"
              value={String(data.totalDeliveries)}
              hint={formatCents(data.totalRevenue)}
            />
            <StatCard
              label="Pickup"
              value={String(data.totalPickups)}
              hint={formatCents(data.pickupRevenue)}
            />
          </div>
          <div>
            <p className="mb-2 font-bold">Pago domicilio</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Efectivo" value={String(data.payments.cash)} />
              <StatCard label="Tarjeta" value={String(data.payments.card)} />
              <StatCard
                label="Transferencia"
                value={String(data.payments.transfer)}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 font-bold">Pago pickup</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Efectivo"
                value={String(data.pickupPayments.cash)}
              />
              <StatCard
                label="Tarjeta"
                value={String(data.pickupPayments.card)}
              />
              <StatCard
                label="Transferencia"
                value={String(data.pickupPayments.transfer)}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
