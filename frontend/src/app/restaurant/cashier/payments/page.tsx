"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ClosePayModal } from "@/src/components/orders/close-pay-modal";
import { closeAndPayOrder } from "@/src/lib/close-and-pay";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { PaymentMethod } from "@/src/services/payment.service";
import { ordersService } from "@/src/services/orders.service";
import { Order } from "@/src/types/order";

export default function CashierPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const ready = await ordersService.getAll({ status: "READY" });
      setOrders(ready);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar las órdenes"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCloseAndPay(payload: {
    method: PaymentMethod;
    receivedCents?: number;
  }) {
    if (!payingOrder) return;

    try {
      setBusyId(payingOrder.id);
      setError("");
      setMessage("");
      await closeAndPayOrder(payingOrder.id, payload);
      setMessage(`Orden #${payingOrder.orderNumber} cobrada`);
      setPayingOrder(null);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cobrar la orden"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Cobrar órdenes</h1>
          <p className="text-zinc-400">
            Órdenes READY → cerrar venta → método de pago del restaurante
          </p>
        </div>
        <Link href="/restaurant/cashier" className="text-zinc-400 hover:text-white">
          ← Volver
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <div>
                <h2 className="text-xl font-bold">Orden #{order.orderNumber}</h2>
                <p className="text-sm text-zinc-400">
                  Mesa {order.table?.label ?? "—"} · {order.items?.length ?? 0}{" "}
                  items
                </p>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-lg font-bold">
                  {formatCents(order.totalCents)}
                </p>
                <button
                  type="button"
                  disabled={busyId === order.id || order.totalCents <= 0}
                  onClick={() => setPayingOrder(order)}
                  className="rounded-xl bg-white px-5 py-3 font-bold text-black disabled:opacity-50"
                >
                  {busyId === order.id ? "Cobrando..." : "Cerrar y cobrar"}
                </button>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <p className="text-zinc-400">No hay órdenes listas para cobrar</p>
          )}
        </div>
      )}

      <ClosePayModal
        open={!!payingOrder}
        totalCents={payingOrder?.totalCents ?? 0}
        busy={busyId === payingOrder?.id}
        onClose={() => setPayingOrder(null)}
        onConfirm={handleCloseAndPay}
      />
    </main>
  );
}
