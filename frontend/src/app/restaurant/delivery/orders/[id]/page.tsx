"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ClosePayModal } from "@/src/components/orders/close-pay-modal";
import { OrderItemRow } from "@/src/components/orders/order-item-row";
import { closeAndPayOrder } from "@/src/lib/close-and-pay";
import { formatPickupAt } from "@/src/lib/format-pickup-at";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderChannelLabel } from "@/src/lib/order-channel-label";
import { orderStatusLabel } from "@/src/lib/order-status-label";
import { deliveryService } from "@/src/services/delivery.service";
import { ordersService } from "@/src/services/orders.service";
import { PaymentMethod } from "@/src/services/payment.service";
import { useAuthStore } from "@/src/store/auth.store";
import { Order } from "@/src/types/order";

export default function DeliveryOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const role = useAuthStore((s) => s.user?.role);
  const canCharge = role === "ADMIN" || role === "CASHIER";
  const backHref =
    role === "CASHIER" || role === "ADMIN"
      ? "/restaurant/cashier/delivery"
      : "/restaurant/delivery/active";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
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

  async function handlePay(payload: {
    method: PaymentMethod;
    receivedCents?: number;
  }) {
    if (!order) return;
    try {
      setBusy(true);
      setError("");
      await closeAndPayOrder(order.id, payload);
      setPayOpen(false);
      setMessage("Pedido cobrado");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cobrar"));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelItem(itemId: string) {
    if (!order) return;
    const reason = window.prompt("Motivo de cancelación", "Error de digitación");
    if (reason == null) return;
    try {
      setBusy(true);
      setError("");
      const updated = await ordersService.cancelItem(order.id, itemId, reason);
      setOrder(updated);
      setMessage("Ítem cancelado");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cancelar el ítem"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <main className="p-4 text-paper sm:p-8">Cargando...</main>;
  }

  if (!order) {
    return (
      <main className="p-4 text-paper sm:p-8">
        <p className="text-danger">{error || "Pedido no encontrado"}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-flame sm:text-xs sm:tracking-[0.24em]">
            Pedido #{order.orderNumber}
          </p>
          <h1 className="mt-2 truncate font-display text-2xl sm:text-4xl">
            {order.delivery?.customerName ?? "Cliente"}
          </h1>
        </div>
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center text-sm text-muted hover:text-paper"
        >
          ← Volver
        </Link>
      </div>

        {error && <p className="text-danger">{error}</p>}
        {message && <p className="text-success">{message}</p>}

        <div className="panel-surface space-y-3 p-6">
          <p className="text-sm text-muted">
            Estado orden:{" "}
            <span className="text-paper">{orderStatusLabel(order.status)}</span>
          </p>
          <p className="text-sm text-muted">
            Estado delivery:{" "}
            <span className="text-paper">
              {order.delivery?.status ?? "—"}
            </span>
          </p>
          <p className="text-sm text-muted">
            Tipo:{" "}
            <span className="text-paper">{orderChannelLabel(order)}</span>
          </p>
          {formatPickupAt(order.pickupAt) ? (
            <p className="text-sm text-muted">
              Recoge:{" "}
              <span className="text-paper">{formatPickupAt(order.pickupAt)}</span>
            </p>
          ) : null}
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
          <ul className="mt-4 space-y-2">
            {order.items.map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                busy={busy}
                onCancel={
                  canCharge &&
                  order.status !== "CREATED" &&
                  order.status !== "CLOSED" &&
                  order.status !== "CANCELED"
                    ? handleCancelItem
                    : undefined
                }
              />
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
            {(order.taxCents ?? 0) > 0 && (
              <div className="flex justify-between text-muted">
                <span>Servicio 5%</span>
                <span>{formatCents(order.taxCents)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {order.status === "CREATED" && (
            <Link
              href={`/restaurant/delivery/orders?orderId=${order.id}`}
              className="btn-primary inline-flex min-h-11 w-full items-center justify-center sm:w-auto"
            >
              Continuar pedido
            </Link>
          )}
          {canCharge &&
            order.status !== "CLOSED" &&
            order.status !== "CANCELED" &&
            (order.items?.length ?? 0) > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setPayOpen(true)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-paper font-semibold text-ink disabled:opacity-40"
              >
                Cerrar y cobrar
              </button>
            )}
        <button
          type="button"
          disabled={
            busy ||
            !order.delivery ||
            order.status === "CREATED" ||
            order.status === "CLOSED" ||
            order.delivery.status === "DELIVERED" ||
            order.delivery.status === "CANCELLED"
          }
          onClick={handleDeliver}
          className="btn-primary w-full disabled:opacity-40"
        >
          {busy ? "Actualizando..." : "Marcar como entregado"}
        </button>
        </div>

      {canCharge ? (
        <ClosePayModal
          open={payOpen}
          totalCents={order.totalCents}
          subtotalCents={order.subtotalCents}
          discountCents={order.discountCents}
          taxCents={order.taxCents}
          busy={busy}
          onClose={() => setPayOpen(false)}
          onConfirm={handlePay}
        />
      ) : null}
    </main>
  );
}
