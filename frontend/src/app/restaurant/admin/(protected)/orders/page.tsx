"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { ordersService } from "@/src/services/orders.service";
import { Order, OrderStatus } from "@/src/types/order";

/** Status filter options shown as tabs above the list. `undefined` means "all". */
const STATUS_FILTERS: { label: string; value: OrderStatus | undefined }[] = [
  { label: "Todas", value: undefined },
  { label: "En curso", value: "CREATED" },
  { label: "En cocina", value: "SENT_TO_KITCHEN" },
  { label: "Listas", value: "READY" },
  { label: "Cerradas", value: "CLOSED" },
];

/** Admin's overview of every order for the tenant, with a quick status filter. */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (statusFilter?: OrderStatus) => {
    try {
      setLoading(true);
      setError("");
      setOrders(await ordersService.getAll(statusFilter ? { status: statusFilter } : undefined));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar las órdenes"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(status);
  }, [load, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Órdenes</h1>
        <p className="text-zinc-400">Todas las órdenes del restaurante</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setStatus(filter.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              status === filter.value
                ? "bg-white text-black"
                : "border border-zinc-700 text-zinc-400 hover:text-white"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/restaurant/admin/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 transition hover:border-white/40"
            >
              <div>
                <p className="font-bold">
                  #{order.orderNumber} · {order.type}
                  {order.table ? ` · Mesa ${order.table.label}` : ""}
                </p>
                <p className="text-sm text-zinc-500">
                  {order.items?.length ?? 0} items ·{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-zinc-500">
                  Creada por {order.createdBy?.fullName ?? "—"}
                  {order.status === "CLOSED" && order.updatedBy
                    ? ` · Facturada por ${order.updatedBy.fullName}`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCents(order.totalCents)}</p>
                <p className="text-sm text-zinc-500">{order.status}</p>
              </div>
            </Link>
          ))}

          {orders.length === 0 && (
            <p className="text-zinc-400">No hay órdenes para este filtro</p>
          )}
        </div>
      )}
    </div>
  );
}
