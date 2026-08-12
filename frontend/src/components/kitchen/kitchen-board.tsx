"use client";

import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { ordersService } from "@/src/services/orders.service";
import { Order, OrderStatus } from "@/src/types/order";

interface Props {
  title: string;
  description: string;
  status: OrderStatus;
  nextStatus?: OrderStatus;
  nextLabel?: string;
}

export function KitchenBoard({
  title,
  description,
  status,
  nextStatus,
  nextLabel,
}: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ordersService.getAll({ status });
      setOrders(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar las órdenes"));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function advance(orderId: string) {
    if (!nextStatus) return;

    try {
      setBusyId(orderId);
      setError("");
      await ordersService.updateStatus(orderId, nextStatus);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo actualizar el estado"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 overflow-x-hidden p-4 sm:p-8">
      <div>
        <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
        <p className="text-zinc-400">{description}</p>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">#{order.orderNumber}</h2>
                  <p className="text-zinc-400">
                    Mesa {order.table?.label ?? "—"} ·{" "}
                    {order.items?.length ?? 0} items ·{" "}
                    {formatCents(order.totalCents)}
                  </p>
                </div>

                {nextStatus && nextLabel && (
                  <button
                    type="button"
                    disabled={busyId === order.id}
                    onClick={() => advance(order.id)}
                    className="rounded-xl bg-white px-5 py-3 font-bold text-black disabled:opacity-50"
                  >
                    {busyId === order.id ? "..." : nextLabel}
                  </button>
                )}
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <p className="text-zinc-400">Sin órdenes en este estado</p>
          )}
        </div>
      )}
    </main>
  );
}
