"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { formatPickupAt } from "@/src/lib/format-pickup-at";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderQueueLabel } from "@/src/lib/order-channel-label";
import { orderStatusLabel } from "@/src/lib/order-status-label";
import { FindOrdersParams, ordersService } from "@/src/services/orders.service";
import { Order } from "@/src/types/order";

type SalesFilter = "open" | "ready" | "closed" | "all";

const FILTERS: { label: string; value: SalesFilter }[] = [
  { label: "Abiertas", value: "open" },
  { label: "Listas", value: "ready" },
  { label: "Cerradas", value: "closed" },
  { label: "Todas", value: "all" },
];

function queryFor(filter: SalesFilter): FindOrdersParams | undefined {
  if (filter === "open") return { activeOnly: true };
  if (filter === "ready") return { status: "READY" };
  if (filter === "closed") return { status: "CLOSED" };
  return undefined;
}

/**
 * Caja cobra desde aquí. The unfiltered dump hid leftovers behind
 * CANCELED rows, so the default is the same open set as the floor.
 */
export default function CashierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<SalesFilter>("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (next: SalesFilter) => {
    try {
      setLoading(true);
      setError("");
      setOrders(await ordersService.getAll(queryFor(next)));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar las órdenes"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">Órdenes</h1>
          <p className="text-zinc-400">Tickets abiertos para cobrar</p>
        </div>
        <Link
          href="/restaurant/app"
          className="inline-flex min-h-11 items-center text-zinc-400 hover:text-white"
        >
          ← Mesas
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition ${
              filter === item.value
                ? "bg-white text-black"
                : "border border-zinc-700 text-zinc-400 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/restaurant/cashier/orders/${order.id}`}
              className="block min-h-11 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-white/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">#{order.orderNumber}</h2>
                  <p className="text-sm text-zinc-400">
                    {orderStatusLabel(order.status)} · {orderQueueLabel(order)}
                    {formatPickupAt(order.pickupAt)
                      ? ` · Recoge ${formatPickupAt(order.pickupAt)}`
                      : ""}
                  </p>
                </div>
                <p className="font-bold">{formatCents(order.totalCents)}</p>
              </div>
            </Link>
          ))}
          {orders.length === 0 && (
            <p className="text-zinc-400">
              {filter === "open"
                ? "No hay órdenes abiertas"
                : "No hay órdenes para este filtro"}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
