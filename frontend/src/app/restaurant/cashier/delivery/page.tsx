"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { deliveryService, DeliveryRecord } from "@/src/services/delivery.service";

export default function CashierDeliveryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await deliveryService.getAll();
      setDeliveries(data.filter((d) => d.status === "PENDING"));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar pedidos"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDispatch(id: string) {
    try {
      setBusyId(id);
      setError("");
      await deliveryService.dispatch(id);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo despachar el pedido"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-flame sm:text-xs sm:tracking-[0.24em]">
            Caja
          </p>
          <h1 className="mt-2 font-display text-2xl sm:text-4xl">
            Despachar domicilios
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Asigna repartidor a los pedidos pendientes.
          </p>
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
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="panel-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl">
                    {delivery.customerName}
                  </h2>
                  <p className="text-sm text-muted">
                    {delivery.address ?? "Pickup"} · {delivery.phone}
                    {delivery.order
                      ? ` · ${delivery.order.status}`
                      : ""}
                  </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  {delivery.order?.status === "CREATED" ? (
                    <Link
                      href={`/restaurant/delivery/orders?orderId=${delivery.orderId}`}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold sm:flex-none"
                    >
                      Continuar
                    </Link>
                  ) : null}
                  {delivery.order &&
                  delivery.order.status !== "CLOSED" &&
                  delivery.order.status !== "CANCELED" &&
                  (delivery.order.totalCents ?? 0) > 0 ? (
                    <Link
                      href={`/restaurant/cashier/orders/${delivery.orderId}`}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold sm:flex-none"
                    >
                      Cobrar
                    </Link>
                  ) : null}
                <button
                  type="button"
                  disabled={busyId === delivery.id}
                  onClick={() => handleDispatch(delivery.id)}
                  className="btn-primary min-h-11 w-full px-5 py-3 text-sm disabled:opacity-50 sm:w-auto"
                >
                  {busyId === delivery.id ? "..." : "Despachar"}
                </button>
                </div>
              </div>
            </div>
          ))}
          {deliveries.length === 0 && (
            <p className="text-muted">No hay pedidos pendientes por despachar</p>
          )}
        </div>
      )}
    </main>
  );
}
