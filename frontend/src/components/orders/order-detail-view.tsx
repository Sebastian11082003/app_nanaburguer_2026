"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ClosePayModal } from "@/src/components/orders/close-pay-modal";
import { closeAndPayOrder } from "@/src/lib/close-and-pay";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderLineLabel } from "@/src/lib/order-line-label";
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
  const canResumeFromTable =
    !!order &&
    (role === "waiter" || role === "admin") &&
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

  if (loading) {
    return <main className="p-8">Cargando orden...</main>;
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
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">
            Orden #{order.orderNumber}
          </h1>
          <p className="text-zinc-400">
            {order.type}
            {order.table ? ` · Mesa ${order.table.label}` : ""} ·{" "}
            {order.status}
          </p>
        </div>
        <Link href={backHref} className="text-sm text-zinc-400 hover:text-white">
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
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {orderLineLabel(item)}
                {item.notes ? ` · ${item.notes}` : ""}
              </span>
              <span>{formatCents(item.lineTotalCents)}</span>
            </li>
          ))}
        </ul>

        {order.items.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500">Sin productos</p>
        )}

        <div className="mt-4 flex justify-between border-t border-zinc-800 pt-4 font-bold">
          <span>Total</span>
          <span>{formatCents(order.totalCents)}</span>
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
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black disabled:opacity-50"
          >
            Cerrar y cobrar
          </button>
        )}

        {canResumeFromTable && (
          <button
            type="button"
            onClick={() =>
              router.push(
                role === "admin"
                  ? `/restaurant/admin/create-order?tableId=${order.table?.id}`
                  : `/restaurant/waiter/create-order?tableId=${order.table?.id}`,
              )
            }
            className="rounded-xl border border-zinc-600 px-5 py-3 text-sm font-bold transition hover:bg-zinc-900"
          >
            Continuar orden
          </button>
        )}

        {canCancel && (
          <button
            type="button"
            disabled={busy}
            onClick={handleCancel}
            className="rounded-xl border border-red-500/40 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            Cancelar orden
          </button>
        )}
      </div>

      <ClosePayModal
        open={payOpen}
        totalCents={order.totalCents}
        busy={busy}
        onClose={() => setPayOpen(false)}
        onConfirm={handleCloseAndPay}
      />
    </div>
  );
}
