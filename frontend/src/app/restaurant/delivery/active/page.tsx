"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { deliveryService, DeliveryRecord } from "@/src/services/delivery.service";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";

export default function DeliveryActivePage() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await deliveryService.getAll();
      setDeliveries(
        data.filter(
          (d) => d.status === "PENDING" || d.status === "DISPATCHED",
        ),
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar pedidos"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeliver(id: string) {
    try {
      setBusyId(id);
      setError("");
      await deliveryService.deliver(id);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo marcar como entregado"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="brand-atmosphere min-h-screen px-6 py-10 text-paper">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-flame">
              Delivery
            </p>
            <h1 className="mt-2 font-display text-4xl">Pedidos activos</h1>
          </div>
          <Link
            href="/restaurant/delivery"
            className="text-sm text-muted hover:text-paper"
          >
            ← Volver
          </Link>
        </div>

        {error && <p className="text-danger">{error}</p>}
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <Link
                key={delivery.id}
                href={`/restaurant/delivery/orders/${delivery.orderId}`}
                className="panel-surface block p-5 transition hover:border-flame/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl">
                      {delivery.customerName}
                    </h2>
                    <p className="text-sm text-muted">
                      {delivery.status} ·{" "}
                      {delivery.address ?? "Pickup"} ·{" "}
                      {delivery.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {delivery.order && (
                      <p className="font-bold">
                        {formatCents(delivery.order.totalCents)}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={busyId === delivery.id}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeliver(delivery.id);
                      }}
                      className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                    >
                      {busyId === delivery.id ? "..." : "Entregado"}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
            {deliveries.length === 0 && (
              <p className="text-muted">No hay pedidos activos</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
