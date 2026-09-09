"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ClosePayModal } from "@/src/components/orders/close-pay-modal";
import { OrderItemRow } from "@/src/components/orders/order-item-row";
import { closeAndPayOrder } from "@/src/lib/close-and-pay";
import { formatPickupAt } from "@/src/lib/format-pickup-at";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderChannelLabel } from "@/src/lib/order-channel-label";
import { orderStatusLabel } from "@/src/lib/order-status-label";
import { ordersService } from "@/src/services/orders.service";
import { PaymentMethod } from "@/src/services/payment.service";
import { useAuthStore } from "@/src/store/auth.store";
import { hasPermission } from "@/src/types/auth";
import { Order } from "@/src/types/order";

type Role = "admin" | "cashier" | "waiter";

interface Props {
  orderId: string;
  role: Role;
  /** Where the "← Volver" link and post-action redirects should go. */
  backHref: string;
}

/**
 * Single order detail screen, shared by admin/cashier/waiter (each via a
 * thin page wrapper that just passes `role` + `backHref`). Keeping one
 * implementation means the three roles can never show inconsistent data
 * for the same order, and any fix here benefits all three at once.
 *
 * Which actions are available depends on `role` and the order's current
 * status — see `canClose`/`canCancel`/`canResume` below. The backend is
 * still the source of truth for what's actually allowed (via `@Roles` and
 * status checks in `OrdersService`), so every action here can fail with a
 * normal error message if the UI's assumption was stale.
 */
export function OrderDetailView({ orderId, role, backHref }: Props) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [payOpen, setPayOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setOrder(await ordersService.getById(orderId));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cargar la orden"));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const isClosed = order?.status === "CLOSED";
  const isCanceled = order?.status === "CANCELED";
  const canClose =
    !!order &&
    !isClosed &&
    !isCanceled &&
    (role === "cashier" ||
      role === "admin" ||
      hasPermission(currentUser, "ORDERS_CLOSE_PAY")) &&
    [
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CREATED",
      "SENT_TO_KITCHEN",
      "IN_PREPARATION",
    ].includes(order.status);
  const canCancel =
    !!order &&
    !isClosed &&
    !isCanceled &&
    (role === "admin" || hasPermission(currentUser, "ORDERS_CANCEL"));
  const canCancelItem =
    !!order &&
    !isClosed &&
    !isCanceled &&
    order.status !== "CREATED" &&
    (role === "admin" ||
      role === "cashier" ||
      hasPermission(currentUser, "ORDERS_CANCEL"));
  const canResumeFromTable =
    !!order &&
    (role === "waiter" || role === "admin" || role === "cashier") &&
    !isClosed &&
    !isCanceled &&
    order.table?.id;

  /** Cashier/admin: close the order and record payment with the chosen method. */
  async function handleCloseAndPay(payload: {
    method: PaymentMethod;
    receivedCents?: number;
  }) {
    if (!order) return;

    try {
      setBusy(true);
      setError("");
      await closeAndPayOrder(order.id, payload);
      setPayOpen(false);
      setMessage("Orden cerrada y cobrada");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cerrar/cobrar la orden"));
    } finally {
      setBusy(false);
    }
  }

  /** Admin-only: voids the order without charging it (e.g. customer walked out). */
  async function handleCancel() {
    if (!order) return;
    if (!window.confirm("¿Cancelar esta orden? No se cobrará.")) return;

    try {
      setBusy(true);
      setError("");
      await ordersService.updateStatus(order.id, "CANCELED");
      setMessage("Orden cancelada");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cancelar la orden"));
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
    return <main className="p-4 sm:p-8">Cargando orden...</main>;
  }

  if (!order) {
    return (
      <main className="p-8">
        <p className="text-red-500">{error || "Orden no encontrada"}</p>
        <Link href={backHref} className="mt-4 inline-block text-zinc-400 hover:text-white">
          ← Volver
        </Link>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">
            Orden #{order.orderNumber}
          </h1>
          <p className="text-zinc-400">
            {orderChannelLabel(order)} · {orderStatusLabel(order.status)}
            {formatPickupAt(order.pickupAt)
              ? ` · Recoge ${formatPickupAt(order.pickupAt)}`
              : ""}
          </p>
        </div>
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center text-sm text-zinc-400 hover:text-white"
        >
          ← Volver
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      {/*
        Traceability block: this is what makes "Órdenes" work as
        documentation rather than just a live operational view — who
        opened the ticket, and (once closed) who closed/charged it.
      */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
        <p>
          Creada por{" "}
          <span className="text-white">
            {order.createdBy?.fullName ?? "—"}
          </span>
          {order.createdBy?.role ? ` (${order.createdBy.role})` : ""} ·{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
        {isClosed && (
          <p className="mt-1">
            Cerrada/facturada por{" "}
            <span className="text-white">
              {order.updatedBy?.fullName ?? "—"}
            </span>
            {order.updatedBy?.role ? ` (${order.updatedBy.role})` : ""}
          </p>
        )}
      </div>

      {order.delivery && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-lg font-bold">Cliente</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {order.delivery.customerName} · {order.delivery.phone}
          </p>
          {order.delivery.address && (
            <p className="text-sm text-zinc-400">
              {order.delivery.address}
              {order.delivery.neighborhood ? ` · ${order.delivery.neighborhood}` : ""}
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-lg font-bold">Productos</h2>
        <ul className="mt-3 space-y-2">
          {order.items.map((item) => (
            <OrderItemRow
              key={item.id}
              item={item}
              busy={busy}
              onCancel={canCancelItem ? handleCancelItem : undefined}
            />
          ))}
        </ul>

        {order.items.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500">Sin productos</p>
        )}

        <div className="mt-4 space-y-1 border-t border-zinc-800 pt-4 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span>{formatCents(order.subtotalCents)}</span>
          </div>
          {(order.discountCents ?? 0) > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>Descuento</span>
              <span>-{formatCents(order.discountCents ?? 0)}</span>
            </div>
          )}
          {(order.taxCents ?? 0) > 0 && (
            <div className="flex justify-between text-zinc-400">
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

      {order.sale && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-lg font-bold">Venta</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Total: {formatCents(order.sale.totalCents)} ·{" "}
            {order.sale.payment ? "Pagada" : "Pendiente de pago"}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canClose && (
          <button
            type="button"
            disabled={busy || order.totalCents <= 0}
            onClick={() => setPayOpen(true)}
            className="min-h-11 w-full rounded-xl bg-white px-5 py-3 text-sm font-bold text-black disabled:opacity-50 sm:w-auto"
          >
            Cerrar y cobrar
          </button>
        )}

        {canResumeFromTable && (
          <button
            type="button"
            onClick={() =>
              router.push(
                `/restaurant/waiter/create-order?tableId=${order.table?.id}`,
              )
            }
            className="min-h-11 w-full rounded-xl border border-zinc-600 px-5 py-3 text-sm font-bold transition hover:bg-zinc-900 sm:w-auto"
          >
            Continuar orden
          </button>
        )}

        {canCancel && (
          <button
            type="button"
            disabled={busy}
            onClick={handleCancel}
            className="min-h-11 w-full rounded-xl border border-red-500/40 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50 sm:w-auto"
          >
            Cancelar orden
          </button>
        )}
      </div>

      <ClosePayModal
        open={payOpen}
        totalCents={order.totalCents}
        subtotalCents={order.subtotalCents}
        discountCents={order.discountCents}
        taxCents={order.taxCents}
        busy={busy}
        onClose={() => setPayOpen(false)}
        onConfirm={handleCloseAndPay}
      />
    </div>
  );
}
