"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { ordersService } from "@/src/services/orders.service";
import { Order } from "@/src/types/order";

/** Waiter's list of orders still in play; tap one to open `OrderDetailView`. */
export default function WaiterOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await ordersService.getAll();
        setOrders(data.filter((order) => order.status !== "CLOSED"));
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudieron cargar las órdenes"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">Órdenes activas</h1>
          <p className="text-zinc-400">Seguimiento de pedidos del mesero</p>
        </div>
        <Link href="/restaurant/waiter" className="text-zinc-400 hover:text-white">
          ← Volver
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/restaurant/waiter/orders/${order.id}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-white/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Orden #{order.orderNumber}</h2>
                  <p className="text-sm text-zinc-400">
                    Mesa {order.table?.label ?? "—"} · {order.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCents(order.totalCents)}</p>
                  <p className="text-sm text-zinc-500">
                    {order.items?.length ?? 0} items
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {orders.length === 0 && (
            <p className="text-zinc-400">No hay órdenes activas</p>
          )}
        </div>
      )}
    </main>
  );
}
