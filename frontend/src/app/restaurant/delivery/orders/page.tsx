"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { useEmptyTicketLeave } from "@/src/hooks/use-empty-ticket-leave";
import { releaseEmptyTicketIfNeeded } from "@/src/lib/empty-ticket-leave";
import { formatCents } from "@/src/lib/money";
import { orderLineLabel } from "@/src/lib/order-line-label";
import { menuService } from "@/src/services/menu.service";
import { ordersService } from "@/src/services/orders.service";
import { MenuItem } from "@/src/types/menu";
import { Order, OrderType } from "@/src/types/order";

export default function DeliveryCreateOrderPage() {
  const router = useRouter();
  const [type, setType] = useState<OrderType>("DELIVERY");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [pickupAt, setPickupAt] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEmptyTicketLeave(order);

  useEffect(() => {
    menuService
      .getItems()
      .then((data) => setItems(data.filter((item) => item.isAvailable)))
      .catch((err: unknown) =>
        setError(getErrorMessage(err, "No se pudo cargar el menú")),
      );
  }, []);

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
    return created;
  }, [
    type,
    customerName,
    customerPhone,
    deliveryAddress,
    neighborhood,
    pickupAt,
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
                  router.push("/restaurant/delivery/active");
                })();
              }}
              className="inline-flex min-h-11 items-center text-sm text-muted hover:text-paper"
            >
              ← Pedidos activos
            </button>
          </div>

          {error && <p className="text-danger">{error}</p>}
          {message && <p className="text-success">{message}</p>}

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

          <button
            type="button"
            disabled={busy || !order || order.status !== "CREATED"}
            onClick={handleSendToKitchen}
            className="btn-primary mt-6 hidden w-full disabled:opacity-40 lg:inline-flex"
          >
            Enviar a cocina
          </button>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <button
          type="button"
          disabled={busy || !order || order.status !== "CREATED"}
          onClick={handleSendToKitchen}
          className="btn-primary min-h-11 w-full disabled:opacity-40"
        >
          Enviar a cocina
        </button>
      </div>
    </main>
  );
}
