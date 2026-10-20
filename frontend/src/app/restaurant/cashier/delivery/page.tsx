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
      // Floor Domicilios stays occupied until the order closes. After
      // dispatch the old PENDING-only list went empty, so tapping the
      // red card had no Cobrar.
      setDeliveries(
        data.filter((d) => {
          const orderStatus = d.order?.status;
          if (!orderStatus || orderStatus === "CANCELED") return false;
          if (orderStatus === "CLOSED") return d.status === "PENDING";
          return (
            d.status === "PENDING" ||
            d.status === "DISPATCHED" ||
            d.status === "DELIVERED"
          );
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
            Domicilios
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Despacha y cobra los que siguen en el canal.
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
          {deliveries.map((delivery) => {
            const orderStatus = delivery.order?.status;
            const assembling = orderStatus === "CREATED";
            const paid = orderStatus === "CLOSED";
            const pending = delivery.status === "PENDING";
            const canDispatch =
              pending &&
              !!orderStatus &&
              !assembling &&
              orderStatus !== "CANCELED";
            const progress =
              delivery.status === "DELIVERED"
                ? "Entregado"
                : delivery.status === "DISPATCHED"
                  ? "En camino"
                  : paid
                    ? "Pagado"
                    : null;
            return (
            <div key={delivery.id} className="panel-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl">
                    {delivery.customerName}
                  </h2>
                  <p className="text-sm text-muted">
                    {delivery.address ?? "Pickup"} · {delivery.phone}
                    {orderStatus ? ` · ${orderStatus}` : ""}
                    {progress ? ` · ${progress}` : ""}
                  </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  {assembling ? (
                    <Link
                      href={`/restaurant/delivery/orders?orderId=${delivery.orderId}`}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold sm:flex-none"
                    >
                      Continuar
                    </Link>
                  ) : null}
                  {delivery.order &&
                  !paid &&
                  orderStatus !== "CANCELED" &&
                  (delivery.order.totalCents ?? 0) > 0 ? (
                    <Link
                      href={`/restaurant/cashier/orders/${delivery.orderId}`}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold sm:flex-none"
                    >
                      Cobrar
                    </Link>
                  ) : null}
                {pending ? (
                <button
                  type="button"
                  disabled={busyId === delivery.id || !canDispatch}
                  onClick={() => handleDispatch(delivery.id)}
                  className="btn-primary min-h-11 w-full px-5 py-3 text-sm disabled:opacity-50 sm:w-auto"
                >
                  {busyId === delivery.id ? "..." : "Despachar"}
                </button>
                ) : null}
                </div>
              </div>
            </div>
            );
          })}
          {deliveries.length === 0 && (
            <p className="text-muted">No hay domicilios abiertos</p>
          )}
        </div>
      )}
    </main>
  );
}
