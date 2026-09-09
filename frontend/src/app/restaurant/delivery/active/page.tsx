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
        data.filter((d) => {
          const orderStatus = d.order?.status;
          if (orderStatus === "CANCELED") return false;
          // Prepaid CLOSED stays on caja dispatch until sent.
          if (d.status === "DISPATCHED") return true;
          return d.status === "PENDING" && orderStatus !== "CLOSED";
        }),
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
    <main className="mx-auto max-w-5xl space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-flame sm:text-xs sm:tracking-[0.24em]">
            Delivery
          </p>
          <h1 className="mt-2 font-display text-2xl sm:text-4xl">
            Pedidos activos
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/restaurant/delivery/orders"
            className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm font-semibold text-ink"
          >
            Nuevo pedido
          </Link>
          <Link
            href="/restaurant/app"
            className="inline-flex min-h-11 items-center text-sm text-muted hover:text-paper"
          >
            ← Mesas
          </Link>
        </div>
      </div>

        {error && <p className="text-danger">{error}</p>}
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="space-y-3">
            {deliveries.map((delivery) => {
              const assembling = delivery.order?.status === "CREATED";
              return (
              <Link
                key={delivery.id}
                href={
                  assembling
                    ? `/restaurant/delivery/orders?orderId=${delivery.orderId}`
                    : `/restaurant/delivery/orders/${delivery.orderId}`
                }
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
                    {assembling ? (
                      <span className="inline-flex min-h-11 items-center text-sm font-semibold">
                        Continuar
                      </span>
                    ) : (
                    <button
                      type="button"
                      disabled={busyId === delivery.id}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeliver(delivery.id);
                      }}
                      className="btn-primary min-h-11 w-full px-4 py-2 text-sm disabled:opacity-50 sm:w-auto"
                    >
                      {busyId === delivery.id ? "..." : "Entregado"}
                    </button>
                    )}
                  </div>
                </div>
              </Link>
              );
            })}
            {deliveries.length === 0 && (
              <p className="text-muted">No hay pedidos activos</p>
            )}
          </div>
        )}
    </main>
  );
}
