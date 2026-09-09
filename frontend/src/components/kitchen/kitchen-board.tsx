"use client";

import { useCallback, useEffect, useState } from "react";

import { BrandMark } from "@/src/components/brand/brand-mark";
import { useHydratedRestaurant } from "@/src/hooks/use-hydrated-restaurant";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderChannelLabel } from "@/src/lib/order-channel-label";
import { orderLineLabel } from "@/src/lib/order-line-label";
import { formatPickupAt } from "@/src/lib/format-pickup-at";
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
  const { restaurant } = useHydratedRestaurant();
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-black sm:text-4xl">{title}</h1>
          <p className="text-sm text-zinc-400 sm:text-base">{description}</p>
          <p className="mt-1 text-sm text-zinc-500">
            Se actualiza solo cada {KITCHEN_POLL_MS / 1000}s
          </p>
        </div>
        {restaurant && (
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark
              size={44}
              name={restaurant.name}
              logoUrl={restaurant.logoUrl}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{restaurant.name}</p>
              <p className="truncate font-mono text-xs text-flame">
                {restaurant.slug}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const lines = order.items ?? [];
            const activeCount = lines.filter((item) => !item.canceledAt).length;
            return (
            <div
              key={order.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">#{order.orderNumber}</h2>
                  <p className="text-zinc-400">
                    {orderChannelLabel(order)} ·{" "}
                    {activeCount} ítems ·{" "}
                    {formatCents(order.totalCents)}
                    {formatPickupAt(order.pickupAt)
                      ? ` · Recoge ${formatPickupAt(order.pickupAt)}`
                      : ""}
                  </p>
                </div>

                {nextStatus && nextLabel && (
                  <button
                    type="button"
                    disabled={busyId === order.id}
                    onClick={() => advance(order.id)}
                    className="min-h-11 w-full rounded-xl bg-white px-5 py-3 font-bold text-black disabled:opacity-50 sm:w-auto"
                  >
                    {busyId === order.id ? "..." : nextLabel}
                  </button>
                )}
              </div>

              <ul className="mt-3 space-y-1 text-sm">
                {lines.map((item) => (
                  <li
                    key={item.id}
                    className={
                      item.canceledAt
                        ? "text-zinc-500 line-through"
                        : "text-zinc-200"
                    }
                  >
                    {item.canceledAt ? "CANCELADO · " : ""}
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
            );
          })}

          {orders.length === 0 && (
            <p className="text-zinc-400">Sin órdenes en este estado</p>
          )}
        </div>
      )}
    </main>
  );
}
