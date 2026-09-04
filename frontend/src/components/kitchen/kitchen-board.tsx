"use client";

import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderLineLabel } from "@/src/lib/order-line-label";
import { ordersService } from "@/src/services/orders.service";
import { Order, OrderStatus } from "@/src/types/order";

/** Short enough for a real shift; not a websocket. Pause while the tab is hidden. */
const KITCHEN_POLL_MS = 8000;

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

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        if (!opts?.silent) {
          setLoading(true);
          setError("");
        }
        const data = await ordersService.getAll({ status });
        setOrders(data);
        if (opts?.silent) setError("");
      } catch (err: unknown) {
        if (!opts?.silent) {
          setError(getErrorMessage(err, "No se pudieron cargar las órdenes"));
        }
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [status],
  );

  useEffect(() => {
    void load();

    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      void load({ silent: true });
    }, KITCHEN_POLL_MS);

    return () => window.clearInterval(id);
  }, [load]);

  async function advance(orderId: string) {
    if (!nextStatus) return;

    try {
      setBusyId(orderId);
      setError("");
      await ordersService.updateStatus(orderId, nextStatus);
      await load({ silent: true });
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
        <p className="mt-1 text-xs text-zinc-600">
          Se actualiza solo cada {KITCHEN_POLL_MS / 1000}s
        </p>
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

              <ul className="mt-3 space-y-1 text-sm">
                {(order.items ?? []).map((item) => (
                  <li key={item.id} className="text-zinc-200">
                    {orderLineLabel(item)}
                    {item.isComplimentary ? (
                      <span className="text-zinc-500"> · cortesía</span>
                    ) : null}
                    {item.notes ? (
                      <span className="text-zinc-500"> · {item.notes}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
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
