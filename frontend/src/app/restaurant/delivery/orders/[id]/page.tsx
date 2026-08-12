"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { ordersService } from "@/src/services/orders.service";
import { deliveryService } from "@/src/services/delivery.service";
import { Order } from "@/src/types/order";

export default function DeliveryOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setOrder(await ordersService.getById(orderId));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cargar el pedido"));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeliver() {
    if (!order?.delivery?.id) return;

    try {
      setBusy(true);
      setError("");
      await deliveryService.deliver(order.delivery.id);
      setMessage("Pedido marcado como entregado");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo marcar como entregado"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <main className="brand-atmosphere min-h-screen p-8 text-paper">Cargando...</main>;
  }

  if (!order) {
    return (
      <main className="brand-atmosphere min-h-screen p-8 text-paper">
        <p className="text-danger">{error || "Pedido no encontrado"}</p>
      </main>
    );
  }

  return (
    <main className="brand-atmosphere min-h-screen px-6 py-10 text-paper">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-flame">
              Pedido #{order.orderNumber}
            </p>
            <h1 className="mt-2 font-display text-4xl">
              {order.delivery?.customerName ?? "Cliente"}
            </h1>
          </div>
          <Link
            href="/restaurant/delivery/active"
            className="text-sm text-muted hover:text-paper"
          >
            ← Volver
          </Link>
        </div>

        {error && <p className="text-danger">{error}</p>}
        {message && <p className="text-success">{message}</p>}

        <div className="panel-surface space-y-3 p-6">
          <p className="text-sm text-muted">
            Estado orden: <span className="text-paper">{order.status}</span>
          </p>
          <p className="text-sm text-muted">
            Estado delivery:{" "}
            <span className="text-paper">
              {order.delivery?.status ?? "—"}
            </span>
          </p>
          <p className="text-sm text-muted">
            Tipo: <span className="text-paper">{order.type}</span>
          </p>
          <p className="text-sm text-muted">
            Teléfono:{" "}
            <span className="text-paper">{order.delivery?.phone ?? "—"}</span>
          </p>
          {order.delivery?.address && (
            <p className="text-sm text-muted">
              Dirección:{" "}
              <span className="text-paper">
                {order.delivery.address}
                {order.delivery.neighborhood
                  ? ` · ${order.delivery.neighborhood}`
                  : ""}
              </span>
            </p>
          )}
        </div>

        <div className="panel-surface p-6">
          <h2 className="font-display text-2xl">Productos</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.quantity}x item</span>
                <span>{formatCents(item.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-bold">
            <span>Total</span>
            <span>{formatCents(order.totalCents)}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={
            busy ||
            !order.delivery ||
            order.delivery.status === "DELIVERED" ||
            order.delivery.status === "CANCELLED"
          }
          onClick={handleDeliver}
          className="btn-primary w-full disabled:opacity-40"
        >
          {busy ? "Actualizando..." : "Marcar como entregado"}
        </button>
      </div>
    </main>
  );
}
