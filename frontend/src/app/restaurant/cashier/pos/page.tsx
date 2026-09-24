"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ClosePayModal } from "@/src/components/orders/close-pay-modal";
import { OrderItemRow } from "@/src/components/orders/order-item-row";
import { useEmptyTicketLeave } from "@/src/hooks/use-empty-ticket-leave";
import { closeAndPayOrder } from "@/src/lib/close-and-pay";
import { posReceiptHref } from "@/src/lib/invoice-href";
import {
  formatPickupAt,
  toDatetimeLocalValue,
} from "@/src/lib/format-pickup-at";
import {
  clearEmptyTicketReleaser,
  hasLiveLines,
  isEmptyOpenTicket,
  releaseEmptyTicketIfNeeded,
} from "@/src/lib/empty-ticket-leave";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderProgressLabel } from "@/src/lib/order-channel-label";
import { menuService } from "@/src/services/menu.service";
import { ordersService } from "@/src/services/orders.service";
import { PaymentMethod } from "@/src/services/payment.service";
import { useAuthStore } from "@/src/store/auth.store";
import { canCancelTicketItem } from "@/src/types/auth";
import { MenuItem } from "@/src/types/menu";
import { Order } from "@/src/types/order";

/**
 * Counter / pickup sale for cashier. No table. Kitchen is optional:
 * close+pay is allowed on CREATED so a drink at the register does not
 * have to go through KDS.
 *
 * Open pickups stay on the floor Llevar card. This screen lists them so
 * caja resumes/charges instead of opening another ticket every time.
 */
export default function CashierPosPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const canCancelItem = canCancelTicketItem(currentUser);
  const [customerName, setCustomerName] = useState("Mostrador");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupAt, setPickupAt] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [openPickups, setOpenPickups] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEmptyTicketLeave(order);

  const loadOpenPickups = useCallback(async () => {
    const rows = await ordersService.getAll({
      type: "PICKUP",
      activeOnly: true,
    });
    setOpenPickups(rows);
  }, []);

  useEffect(() => {
    menuService
      .getItems()
      .then((data) => setItems(data.filter((item) => item.isAvailable)))
      .catch((err: unknown) =>
        setError(getErrorMessage(err, "No se pudo cargar el menú")),
      );
    loadOpenPickups().catch((err: unknown) =>
      setError(getErrorMessage(err, "No se pudieron cargar pedidos abiertos")),
    );
  }, [loadOpenPickups]);

  async function ensureOrder(): Promise<Order | null> {
    if (order) return order;
    if (!customerName.trim()) {
      setError("Nombre del cliente es obligatorio");
      return null;
    }
    const created = await ordersService.create({
      type: "PICKUP",
      source: "CASHIER",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      pickupAt: pickupAt ? new Date(pickupAt).toISOString() : undefined,
    });
    setOrder(created);
    await loadOpenPickups();
    return created;
  }

  async function handleStart(e: FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);
      setError("");
      setMessage("");
      const created = await ensureOrder();
      if (created) setMessage(`Orden #${created.orderNumber} abierta`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo abrir la orden"));
    } finally {
      setBusy(false);
    }
  }

  async function handleAddItem(menuItemId: string) {
    try {
      setBusy(true);
      setError("");
      const current = await ensureOrder();
      if (!current) return;
      const updated = await ordersService.addItem(current.id, {
        menuItemId,
        quantity: 1,
      });
      setOrder(updated);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo agregar el producto"));
    } finally {
      setBusy(false);
    }
  }

  async function handleSendToKitchen() {
    if (!order) return;
    if (!order.items?.length) {
      setError("Agrega al menos un producto");
      return;
    }
    try {
      setBusy(true);
      setError("");
      const updated = await ordersService.updateStatus(
        order.id,
        "SENT_TO_KITCHEN",
      );
      setOrder(updated);
      setMessage(`Pedido #${updated.orderNumber} enviado a cocina`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo enviar a cocina"));
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
      const paid = await closeAndPayOrder(order.id, payload);
      setPayOpen(false);
      if (paid.invoiceId) {
        router.push(posReceiptHref(paid.invoiceId, "/restaurant/cashier/pos"));
        return;
      }
      setMessage(`Orden #${order.orderNumber} cobrada`);
      setOrder(null);
      setCustomerName("Mostrador");
      setCustomerPhone("");
      await loadOpenPickups();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cobrar"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDiscard() {
    if (!order || !isEmptyOpenTicket(order)) return;
    if (!window.confirm("¿Descartar este pedido? No hay productos.")) return;
    clearEmptyTicketReleaser();
    try {
      setBusy(true);
      setError("");
      await ordersService.updateStatus(order.id, "CANCELED");
      setMessage(`Pedido #${order.orderNumber} descartado`);
      setOrder(null);
      setCustomerName("Mostrador");
      setCustomerPhone("");
      await loadOpenPickups();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo descartar el pedido"));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelItem(itemId: string) {
    if (!order) return;
    if (order.status === "CREATED") {
      try {
        setBusy(true);
        setError("");
        const updated = await ordersService.removeItem(order.id, itemId);
        setOrder(updated);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudo quitar el producto"));
      } finally {
        setBusy(false);
      }
      return;
    }
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

  async function resumePickup(open: Order) {
    try {
      setBusy(true);
      setError("");
      await releaseEmptyTicketIfNeeded();
      const fresh = await ordersService.getById(open.id);
      setOrder(fresh);
      setCustomerName(fresh.delivery?.customerName || "Mostrador");
      setCustomerPhone(fresh.delivery?.phone ?? "");
      setPickupAt(toDatetimeLocalValue(fresh.pickupAt));
      setMessage(`Continuando #${fresh.orderNumber}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo retomar el pedido"));
    } finally {
      setBusy(false);
    }
  }

  const canEdit = !order || order.status === "CREATED";
  const canEditPickup =
    !order || (order.status !== "CLOSED" && order.status !== "CANCELED");
  const canDiscard = isEmptyOpenTicket(order);
  const kitchenDisabled =
    busy || !order || order.status !== "CREATED" || !hasLiveLines(order);
  const chargeDisabled =
    busy ||
    !order ||
    !hasLiveLines(order) ||
    order.totalCents <= 0 ||
    order.status === "CLOSED";

  return (
    <main className="relative mx-auto max-w-6xl space-y-6 overflow-x-hidden pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-black sm:text-4xl">POS mostrador</h1>
          <p className="text-sm text-zinc-400 sm:text-base">
            Pickup sin mesa. Cobra ya o manda a cocina.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void (async () => {
              await releaseEmptyTicketIfNeeded();
              router.push("/restaurant/app");
            })();
          }}
          className="inline-flex min-h-11 items-center text-zinc-400 hover:text-white"
        >
          ← Mesas
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      {openPickups.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Llevar abiertos
          </p>
          {openPickups.map((open) => {
            const progress = orderProgressLabel(open);
            return (
            <button
              key={open.id}
              type="button"
              disabled={busy}
              onClick={() => void resumePickup(open)}
              className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left disabled:opacity-40 ${
                order?.id === open.id
                  ? "border-paper bg-paper/10"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              <span className="min-w-0 truncate text-sm font-semibold">
                #{open.orderNumber} ·{" "}
                {open.delivery?.customerName ?? open.status}
                {progress ? ` · ${progress}` : ""}
                {formatPickupAt(open.pickupAt)
                  ? ` · ${formatPickupAt(open.pickupAt)}`
                  : ""}
              </span>
              <span className="text-sm font-bold tabular-nums">
                {formatCents(open.totalCents)}
              </span>
            </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <form
            onSubmit={handleStart}
            className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base"
              placeholder="Nombre del cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={!canEdit}
            />
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base"
              placeholder="Teléfono (opcional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              disabled={!canEdit}
            />
            <label className="block text-sm text-zinc-400">
              Hora de recoger
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-paper"
                value={pickupAt}
                onChange={(e) => setPickupAt(e.target.value)}
                onBlur={() => {
                  if (!order || !canEditPickup) return;
                  void ordersService
                    .setPickupAt(
                      order.id,
                      pickupAt ? new Date(pickupAt).toISOString() : null,
                    )
                    .then(setOrder)
                    .catch((err: unknown) =>
                      setError(
                        getErrorMessage(err, "No se pudo guardar la hora"),
                      ),
                    );
                }}
                disabled={!canEditPickup}
              />
            </label>
            {!order && (
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-white py-3 font-bold text-black disabled:opacity-40"
              >
                {busy ? "Abriendo..." : "Abrir orden"}
              </button>
            )}
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={busy || !canEdit}
                onClick={() => handleAddItem(item.id)}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left hover:border-white/40 disabled:opacity-40"
              >
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {formatCents(item.priceCents)}
                </p>
              </button>
            ))}
          </div>
        </section>

        <aside className="h-fit space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-2xl font-bold">Resumen</h2>
          <p className="text-sm text-zinc-400">
            {order
              ? `#${order.orderNumber} · ${order.status}${
                  formatPickupAt(order.pickupAt)
                    ? ` · Recoge ${formatPickupAt(order.pickupAt)}`
                    : ""
                }`
              : "Sin orden"}
          </p>
          <ul className="space-y-2">
            {(order?.items ?? []).map((line) => (
              <OrderItemRow
                key={line.id}
                item={line}
                busy={busy}
                onCancel={
                  canCancelItem &&
                  order &&
                  order.status !== "CLOSED" &&
                  order.status !== "CANCELED"
                    ? handleCancelItem
                    : undefined
                }
                cancelLabel={order?.status === "CREATED" ? "Quitar" : "Cancelar"}
              />
            ))}
          </ul>
          {(order?.taxCents ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Servicio 5%</span>
              <span>{formatCents(order?.taxCents ?? 0)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-800 pt-3 font-bold">
            <span>Total</span>
            <span>{formatCents(order?.totalCents ?? 0)}</span>
          </div>
          <div className="hidden lg:block space-y-3">
            <button
              type="button"
              disabled={kitchenDisabled}
              onClick={handleSendToKitchen}
              className="w-full rounded-xl border border-zinc-700 py-3 font-bold disabled:opacity-40"
            >
              Enviar a cocina
            </button>
            <button
              type="button"
              disabled={chargeDisabled}
              onClick={() => setPayOpen(true)}
              className="w-full rounded-xl bg-white py-3 font-bold text-black disabled:opacity-40"
            >
              Cerrar y cobrar
            </button>
            {canDiscard ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDiscard()}
                className="w-full rounded-xl border border-white/20 py-3 text-sm font-semibold disabled:opacity-40"
              >
                Descartar pedido
              </button>
            ) : null}
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl gap-2">
          {canDiscard ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleDiscard()}
              className="min-h-11 flex-1 rounded-xl border border-white/20 px-3 py-3 text-sm font-bold disabled:opacity-40"
            >
              Descartar pedido
            </button>
          ) : (
            <>
          <button
            type="button"
            disabled={kitchenDisabled}
            onClick={handleSendToKitchen}
            className="min-h-11 flex-1 rounded-xl border border-zinc-700 px-3 py-3 text-sm font-bold disabled:opacity-40"
          >
            Enviar a cocina
          </button>
          <button
            type="button"
            disabled={chargeDisabled}
            onClick={() => setPayOpen(true)}
            className="min-h-11 flex-1 rounded-xl bg-white px-3 py-3 text-sm font-bold text-black disabled:opacity-40"
          >
            Cerrar y cobrar
          </button>
            </>
          )}
        </div>
      </div>

      <ClosePayModal
        open={payOpen}
        totalCents={order?.totalCents ?? 0}
        subtotalCents={order?.subtotalCents}
        discountCents={order?.discountCents}
        taxCents={order?.taxCents}
        busy={busy}
        onClose={() => setPayOpen(false)}
        onConfirm={handlePay}
      />
    </main>
  );
}
