"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { ClosePayModal } from "@/src/components/orders/close-pay-modal";
import { closeAndPayOrder } from "@/src/lib/close-and-pay";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderLineLabel } from "@/src/lib/order-line-label";
import { menuService } from "@/src/services/menu.service";
import { ordersService } from "@/src/services/orders.service";
import { PaymentMethod } from "@/src/services/payment.service";
import { MenuItem } from "@/src/types/menu";
import { Order } from "@/src/types/order";

/**
 * Counter / pickup sale for cashier. No table. Kitchen is optional:
 * close+pay is allowed on CREATED so a drink at the register does not
 * have to go through KDS.
 */
export default function CashierPosPage() {
  const [customerName, setCustomerName] = useState("Mostrador");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    menuService
      .getItems()
      .then((data) => setItems(data.filter((item) => item.isAvailable)))
      .catch((err: unknown) =>
        setError(getErrorMessage(err, "No se pudo cargar el menú")),
      );
  }, []);

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
    });
    setOrder(created);
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
      await closeAndPayOrder(order.id, payload);
      setPayOpen(false);
      setMessage(`Orden #${order.orderNumber} cobrada`);
      setOrder(null);
      setCustomerName("Mostrador");
      setCustomerPhone("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cobrar"));
    } finally {
      setBusy(false);
    }
  }

  const canEdit = !order || order.status === "CREATED";

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">POS mostrador</h1>
          <p className="text-zinc-400">
            Pickup sin mesa. Cobra ya o manda a cocina.
          </p>
        </div>
        <Link href="/restaurant/cashier" className="text-zinc-400 hover:text-white">
          ← Volver
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <form
            onSubmit={handleStart}
            className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
              placeholder="Nombre del cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={!canEdit}
            />
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
              placeholder="Teléfono (opcional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              disabled={!canEdit}
            />
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
            {order ? `#${order.orderNumber} · ${order.status}` : "Sin orden"}
          </p>
          <ul className="space-y-2 text-sm">
            {(order?.items ?? []).map((line) => (
              <li key={line.id} className="flex justify-between gap-3">
                <span>{orderLineLabel(line)}</span>
                <span>{formatCents(line.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-zinc-800 pt-3 font-bold">
            <span>Total</span>
            <span>{formatCents(order?.totalCents ?? 0)}</span>
          </div>
          <button
            type="button"
            disabled={busy || !order || order.status !== "CREATED"}
            onClick={handleSendToKitchen}
            className="w-full rounded-xl border border-zinc-700 py-3 font-bold disabled:opacity-40"
          >
            Enviar a cocina
          </button>
          <button
            type="button"
            disabled={busy || !order || !order.items?.length || order.status === "CLOSED"}
            onClick={() => setPayOpen(true)}
            className="w-full rounded-xl bg-white py-3 font-bold text-black disabled:opacity-40"
          >
            Cobrar
          </button>
        </aside>
      </div>

      <ClosePayModal
        open={payOpen}
        totalCents={order?.totalCents ?? 0}
        busy={busy}
        onClose={() => setPayOpen(false)}
        onConfirm={handlePay}
      />
    </main>
  );
}
