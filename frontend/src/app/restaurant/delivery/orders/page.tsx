"use client";

import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ClosePayModal } from "@/src/components/orders/close-pay-modal";
import { useEmptyTicketLeave } from "@/src/hooks/use-empty-ticket-leave";
import { closeAndPayOrder } from "@/src/lib/close-and-pay";
import {
  clearEmptyTicketReleaser,
  isEmptyCreatedDraft,
  releaseEmptyTicketIfNeeded,
} from "@/src/lib/empty-ticket-leave";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderLineLabel } from "@/src/lib/order-line-label";
import { menuService } from "@/src/services/menu.service";
import { ordersService } from "@/src/services/orders.service";
import { PaymentMethod } from "@/src/services/payment.service";
import { useAuthStore } from "@/src/store/auth.store";
import { MenuItem } from "@/src/types/menu";
import { Order, OrderType } from "@/src/types/order";

/**
 * Delivery/pickup create. Open DELIVERY tickets used to stay on the floor
 * with no way to add items again (active list only offers Entregado).
 * Cashier/admin can close+pay here; the rider cannot (API close is caja).
 */
function DeliveryCreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("orderId");
  const role = useAuthStore((s) => s.user?.role);
  const canCharge = role === "ADMIN" || role === "CASHIER";
  const [type, setType] = useState<OrderType>("DELIVERY");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [pickupAt, setPickupAt] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [openDeliveries, setOpenDeliveries] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEmptyTicketLeave(order);

  const loadOpenDeliveries = useCallback(async () => {
    const rows = await ordersService.getAll({
      type: "DELIVERY",
      activeOnly: true,
    });
    setOpenDeliveries(rows);
  }, []);

  function applyOrder(open: Order) {
    setOrder(open);
    setType(open.type);
    setCustomerName(open.delivery?.customerName ?? "");
    setCustomerPhone(open.delivery?.phone ?? "");
    setDeliveryAddress(open.delivery?.address ?? "");
    setNeighborhood(open.delivery?.neighborhood ?? "");
  }

  useEffect(() => {
    menuService
      .getItems()
      .then((data) => setItems(data.filter((item) => item.isAvailable)))
      .catch((err: unknown) =>
        setError(getErrorMessage(err, "No se pudo cargar el menú")),
      );
    loadOpenDeliveries().catch((err: unknown) =>
      setError(getErrorMessage(err, "No se pudieron cargar pedidos abiertos")),
    );
  }, [loadOpenDeliveries]);

  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;
    ordersService
      .getById(resumeId)
      .then((open) => {
        if (!cancelled) {
          applyOrder(open);
          setMessage(`Continuando #${open.orderNumber}`);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "No se pudo retomar el pedido"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  const createOrder = useCallback(async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Nombre y teléfono del cliente son obligatorios");
      return null;
    }

    if (type === "DELIVERY" && !deliveryAddress.trim()) {
      setError("La dirección es obligatoria para domicilio");
      return null;
    }

    const created = await ordersService.create({
      type,
      source: "DELIVERY",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress:
        type === "DELIVERY" ? deliveryAddress.trim() : undefined,
      neighborhood: neighborhood.trim() || undefined,
      paymentMethod: "CASH",
      pickupAt:
        type === "PICKUP" && pickupAt
          ? new Date(pickupAt).toISOString()
          : undefined,
    });

    setOrder(created);
    await loadOpenDeliveries();
    return created;
  }, [
    type,
    customerName,
    customerPhone,
    deliveryAddress,
    neighborhood,
    pickupAt,
    loadOpenDeliveries,
  ]);

  async function handleStart(e: FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);
      setError("");
      setMessage("");
      await createOrder();
      setMessage("Pedido creado. Agrega productos.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo crear el pedido"));
    } finally {
      setBusy(false);
    }
  }

  async function handleAddItem(menuItemId: string) {
    try {
      setBusy(true);
      setError("");
      let current = order;
      if (!current) {
        current = await createOrder();
        if (!current) return;
      }
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
      await closeAndPayOrder(order.id, payload);
      setPayOpen(false);
      setMessage(`Pedido #${order.orderNumber} cobrado`);
      setOrder(null);
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setNeighborhood("");
      await loadOpenDeliveries();
      router.replace("/restaurant/delivery/orders");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cobrar"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDiscard() {
    if (!order || !isEmptyCreatedDraft(order)) return;
    if (!window.confirm("¿Descartar este pedido? No hay productos.")) return;
    clearEmptyTicketReleaser();
    try {
      setBusy(true);
      setError("");
      await ordersService.updateStatus(order.id, "CANCELED");
      setMessage(`Pedido #${order.orderNumber} descartado`);
      setOrder(null);
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setNeighborhood("");
      await loadOpenDeliveries();
      router.replace("/restaurant/delivery/orders");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo descartar el pedido"));
    } finally {
      setBusy(false);
    }
  }

  async function resumeOpen(open: Order) {
    try {
      setBusy(true);
      setError("");
      await releaseEmptyTicketIfNeeded();
      const fresh = await ordersService.getById(open.id);
      applyOrder(fresh);
      setMessage(`Continuando #${fresh.orderNumber}`);
      router.replace(`/restaurant/delivery/orders?orderId=${fresh.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo retomar el pedido"));
    } finally {
      setBusy(false);
    }
  }

  const canDiscard = isEmptyCreatedDraft(order);
  const chargeDisabled =
    busy ||
    !order ||
    !order.items?.length ||
    order.status === "CLOSED" ||
    order.status === "CANCELED";
  const afterCreateHref =
    role === "CASHIER" || role === "ADMIN"
      ? "/restaurant/cashier/delivery"
      : "/restaurant/delivery/active";

  return (
    <main className="relative overflow-x-hidden pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="mx-auto grid max-w-6xl gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-flame">
                Delivery
              </p>
              <h1 className="mt-2 font-display text-2xl sm:text-4xl">Nuevo pedido</h1>
            </div>
            <button
              type="button"
              onClick={() => {
                void (async () => {
                  await releaseEmptyTicketIfNeeded();
                  router.push(afterCreateHref);
                })();
              }}
              className="inline-flex min-h-11 items-center text-sm text-muted hover:text-paper"
            >
              ← {role === "CASHIER" || role === "ADMIN" ? "Despacho" : "Pedidos activos"}
            </button>
          </div>

          {error && <p className="text-danger">{error}</p>}
          {message && <p className="text-success">{message}</p>}

          {openDeliveries.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Domicilios abiertos
              </p>
              {openDeliveries.map((open) => (
                <button
                  key={open.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void resumeOpen(open)}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left disabled:opacity-40 ${
                    order?.id === open.id
                      ? "border-paper bg-paper/10"
                      : "border-white/10 bg-zinc-950"
                  }`}
                >
                  <span className="min-w-0 truncate text-sm font-semibold">
                    #{open.orderNumber} ·{" "}
                    {open.delivery?.customerName ?? open.status}
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular-nums">
                    {formatCents(open.totalCents)}
                  </span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleStart} className="panel-surface space-y-4 p-4 sm:p-6">
            <div className="flex gap-2">
              {(["DELIVERY", "PICKUP"] as OrderType[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    type === option
                      ? "bg-paper text-ink"
                      : "border border-white/15 text-muted"
                  }`}
                >
                  {option === "DELIVERY" ? "Domicilio" : "Pickup"}
                </button>
              ))}
            </div>

            <input
              className="field-input"
              placeholder="Nombre del cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <input
              className="field-input"
              placeholder="Teléfono"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
            {type === "DELIVERY" && (
              <>
                <input
                  className="field-input"
                  placeholder="Dirección"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
                <input
                  className="field-input"
                  placeholder="Barrio (opcional)"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </>
            )}
            {type === "PICKUP" && (
              <label className="block text-sm text-muted">
                Hora de recoger
                <input
                  type="datetime-local"
                  className="field-input mt-1"
                  value={pickupAt}
                  onChange={(e) => setPickupAt(e.target.value)}
                />
              </label>
            )}

            {!order && (
              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full"
              >
                {busy ? "Creando..." : "Crear pedido"}
              </button>
            )}
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={busy || (order?.status !== undefined && order.status !== "CREATED")}
                onClick={() => handleAddItem(item.id)}
                className="panel-surface p-4 text-left transition hover:border-flame/40 disabled:opacity-40"
              >
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatCents(item.priceCents)}
                </p>
              </button>
            ))}
          </div>
        </section>

        <aside className="panel-surface h-fit p-4 sm:p-6">
          <h2 className="font-display text-xl sm:text-2xl">Resumen</h2>
          <p className="mt-2 text-sm text-muted">
            {order
              ? `#${order.orderNumber} · ${order.status}`
              : "Sin pedido abierto"}
          </p>

          <ul className="mt-6 space-y-3 text-sm">
            {(order?.items ?? []).map((line) => (
              <li key={line.id} className="flex justify-between gap-3">
                <span>{orderLineLabel(line)}</span>
                <span>{formatCents(line.lineTotalCents)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between border-t border-white/10 pt-4 font-bold">
            <span>Total</span>
            <span>{formatCents(order?.totalCents ?? 0)}</span>
          </div>

          <div className="mt-6 hidden space-y-3 lg:block">
            <button
              type="button"
              disabled={busy || !order || order.status !== "CREATED"}
              onClick={handleSendToKitchen}
              className="btn-primary w-full disabled:opacity-40"
            >
              Enviar a cocina
            </button>
            {canCharge ? (
              <button
                type="button"
                disabled={chargeDisabled}
                onClick={() => setPayOpen(true)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-paper font-semibold text-ink disabled:opacity-40"
              >
                Cerrar y cobrar
              </button>
            ) : null}
            {canDiscard ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDiscard()}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/20 text-sm font-semibold disabled:opacity-40"
              >
                Descartar pedido
              </button>
            ) : null}
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="flex gap-2">
          {canDiscard ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleDiscard()}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/20 text-sm font-semibold disabled:opacity-40"
            >
              Descartar pedido
            </button>
          ) : (
            <>
          <button
            type="button"
            disabled={busy || !order || order.status !== "CREATED"}
            onClick={handleSendToKitchen}
            className="btn-primary min-h-11 flex-1 disabled:opacity-40"
          >
            Enviar a cocina
          </button>
          {canCharge ? (
            <button
              type="button"
              disabled={chargeDisabled}
              onClick={() => setPayOpen(true)}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-paper px-3 text-sm font-semibold text-ink disabled:opacity-40"
            >
              Cerrar y cobrar
            </button>
          ) : null}
            </>
          )}
        </div>
      </div>

      {canCharge ? (
        <ClosePayModal
          open={payOpen}
          totalCents={order?.totalCents ?? 0}
          busy={busy}
          onClose={() => setPayOpen(false)}
          onConfirm={handlePay}
        />
      ) : null}
    </main>
  );
}

export default function DeliveryCreateOrderRoute() {
  return (
    <Suspense fallback={<main className="p-8 text-muted">Cargando...</main>}>
      <DeliveryCreateOrderPage />
    </Suspense>
  );
}
