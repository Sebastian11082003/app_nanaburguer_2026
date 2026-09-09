"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ClosePayModal } from "@/src/components/orders/close-pay-modal";
import { OrderItemRow } from "@/src/components/orders/order-item-row";
import { closeAndPayOrder } from "@/src/lib/close-and-pay";
import { adminReceiptHref } from "@/src/lib/invoice-href";
import { isEmptyOpenDineIn } from "@/src/lib/empty-ticket-leave";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderStatusLabel } from "@/src/lib/order-status-label";
import { ordersService } from "@/src/services/orders.service";
import { PaymentMethod } from "@/src/services/payment.service";
import { Table, tablesService } from "@/src/services/tables.service";
import { useAuthStore } from "@/src/store/auth.store";
import { canCancelTicketItem } from "@/src/types/auth";

/**
 * Admin detail for a single table: activate/deactivate, preview active
 * order, and jump into take/continue order when the table is in service.
 */
export default function AdminTableDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const canCancelItem = canCancelTicketItem(useAuthStore((s) => s.user));
  const tableId = params.id;

  const [table, setTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [payOpen, setPayOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setTable(await tablesService.getById(tableId));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cargar la mesa"));
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggleActive() {
    if (!table) return;

    try {
      setBusy(true);
      setError("");
      await tablesService.update(table.id, { isActive: !table.isActive });
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo actualizar la mesa"));
    } finally {
      setBusy(false);
    }
  }

  async function handleReleaseTable() {
    if (!table?.activeOrder) return;
    if (!window.confirm("¿Liberar la mesa? No hay productos en el ticket.")) {
      return;
    }

    try {
      setBusy(true);
      setError("");
      setMessage("");
      await ordersService.updateStatus(table.activeOrder.id, "CANCELED");
      setMessage("Mesa liberada");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo liberar la mesa"));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelItem(itemId: string) {
    if (!table?.activeOrder) return;
    const reason = window.prompt("Motivo de cancelación", "Error de digitación");
    if (reason == null) return;

    try {
      setBusy(true);
      setError("");
      setMessage("");
      await ordersService.cancelItem(table.activeOrder.id, itemId, reason);
      setMessage("Ítem cancelado");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cancelar el ítem"));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!table?.activeOrder) return;
    if (!window.confirm("¿Quitar este producto del ticket?")) return;

    try {
      setBusy(true);
      setError("");
      setMessage("");
      await ordersService.removeItem(table.activeOrder.id, itemId);
      setMessage("Ítem quitado");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo quitar el ítem"));
    } finally {
      setBusy(false);
    }
  }

  async function handleCloseAndPay(payload: {
    method: PaymentMethod;
    receivedCents?: number;
  }) {
    if (!table?.activeOrder) return;

    try {
      setBusy(true);
      setError("");
      setMessage("");
      const paid = await closeAndPayOrder(table.activeOrder.id, payload);
      setPayOpen(false);
      if (paid.invoiceId) {
        router.push(
          adminReceiptHref(
            paid.invoiceId,
            `/restaurant/admin/tables/${table.id}`,
          ),
        );
        return;
      }
      setMessage("Orden cerrada y cobrada");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cerrar/cobrar la orden"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p>Cargando mesa...</p>;
  }

  if (!table) {
    return <p className="text-danger">{error || "Mesa no encontrada"}</p>;
  }

  const order = table.activeOrder;
  const canReleaseEmpty = isEmptyOpenDineIn(order);
  const canEditLines =
    !!order && order.status !== "CLOSED" && order.status !== "CANCELED";
  const removeWhileCreated = order?.status === "CREATED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mesa {table.label}</h1>
          <p className="text-zinc-400">{table.capacity} personas</p>
        </div>
        <Link href="/restaurant/admin/tables" className="text-zinc-400 hover:text-white">
          ← Volver
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-500">Estado</p>
            <p className="mt-1 text-xl font-bold">
              {!table.isActive
                ? "Inactiva"
                : order
                  ? `Ocupada · Orden #${order.orderNumber}`
                  : "Disponible"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {table.isActive && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/restaurant/admin/create-order?tableId=${table.id}`,
                  )
                }
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black"
              >
                {order ? "Continuar orden" : "Tomar orden"}
              </button>
            )}
            {canReleaseEmpty && (
              <button
                type="button"
                disabled={busy}
                onClick={handleReleaseTable}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/5 disabled:opacity-50"
              >
                Liberar mesa
              </button>
            )}
            {order && order.totalCents > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setPayOpen(true)}
                className="rounded-xl border border-emerald-500/50 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
              >
                Cerrar y cobrar
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={handleToggleActive}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-900 disabled:opacity-50"
            >
              {table.isActive ? "Desactivar mesa" : "Activar mesa"}
            </button>
          </div>
        </div>
      </div>

      {order && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold">Orden activa</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Estado: {orderStatusLabel(order.status)} · Creada:{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>

          <ul className="mt-4 space-y-2">
            {order.items.map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                busy={busy}
                cancelLabel={removeWhileCreated ? "Quitar" : "Cancelar"}
                onCancel={
                  canEditLines && (removeWhileCreated || canCancelItem)
                    ? removeWhileCreated
                      ? handleRemoveItem
                      : handleCancelItem
                    : undefined
                }
              />
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-zinc-800 pt-4 text-sm">
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
      )}

      <ClosePayModal
        open={payOpen}
        totalCents={order?.totalCents ?? 0}
        subtotalCents={order?.subtotalCents}
        discountCents={order?.discountCents}
        taxCents={order?.taxCents}
        busy={busy}
        onClose={() => setPayOpen(false)}
        onConfirm={handleCloseAndPay}
      />
    </div>
  );
}
