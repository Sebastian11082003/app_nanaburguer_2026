"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { ordersService } from "@/src/services/orders.service";
import { Order } from "@/src/types/order";

export default function DeliveryHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await ordersService.getAll();
        setOrders(
          data.filter(
            (order) =>
              (order.type === "DELIVERY" || order.type === "PICKUP") &&
              (order.status === "CLOSED" ||
                order.status === "DELIVERED" ||
                order.status === "CANCELED"),
          ),
        );
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudo cargar el historial"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="brand-atmosphere min-h-screen px-6 py-10 text-paper">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-flame">
              Delivery
            </p>
            <h1 className="mt-2 font-display text-4xl">Historial</h1>
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
            {orders.map((order) => (
              <div key={order.id} className="panel-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl">
                      #{order.orderNumber}
                    </h2>
                    <p className="text-sm text-muted">
                      {order.type} · {order.status}
                    </p>
                  </div>
                  <p className="font-bold">{formatCents(order.totalCents)}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-muted">Sin historial todavía</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
