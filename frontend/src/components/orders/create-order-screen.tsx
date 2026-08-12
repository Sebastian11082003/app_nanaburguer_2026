"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AddItemModal } from "@/src/components/orders/add-item-modal";
import { ClosePayModal } from "@/src/components/orders/close-pay-modal";
import { KitchenTicket } from "@/src/components/orders/kitchen-ticket";
import { TransferTableModal } from "@/src/components/tables/transfer-table-modal";
import { categoryColor } from "@/src/lib/category-color";
import { closeAndPayOrder } from "@/src/lib/close-and-pay";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { orderLineLabel } from "@/src/lib/order-line-label";
import { menuService } from "@/src/services/menu.service";
import { ordersService } from "@/src/services/orders.service";
import { PaymentMethod } from "@/src/services/payment.service";
import { Table, tablesService } from "@/src/services/tables.service";
import { useAuthStore } from "@/src/store/auth.store";
import { Category, MenuItem } from "@/src/types/menu";
import { Order } from "@/src/types/order";
import { hasPermission } from "@/src/types/auth";

export type CreateOrderScreenProps = {
  /** Back link target (e.g. `/restaurant/waiter/tables`). */
  tablesHref: string;
  /**
   * Path used after a table transfer so refresh keeps the right role shell
   * (e.g. `/restaurant/admin/create-order`).
   */
  createOrderPath: string;
  /**
   * Admin can close/charge and cancel from the table (Loggro-style).
   * Waiter keeps kitchen-focused actions only.
   */
  role?: "admin" | "waiter";
};

/**
 * Shared dine-in ordering UI for waiter and admin: open/resume a table's
 * order, add/remove items, send to kitchen, transfer table.
 *
 * Navigated to as `…/create-order?tableId=<id>`. Opening an order for a
 * table that already has one resumes it (backend dedupe in
 * `OrdersService.create`).
 */
export function CreateOrderScreen({
  tablesHref,
  createOrderPath,
  role = "waiter",
}: CreateOrderScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId") ?? undefined;
  const currentUser = useAuthStore((state) => state.user);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  /** When true, "Enviar a cocina" skips opening the printable comanda. */
  const [skipPrint, setSkipPrint] = useState(false);
  const [discountInput, setDiscountInput] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [pickingItem, setPickingItem] = useState<MenuItem | null>(null);

  const bootstrap = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [menuItems, menuCategories, allTables] = await Promise.all([
        menuService.getItems(),
        menuService.getCategories(),
        tablesService.getAll(),
      ]);
      setItems(menuItems.filter((item) => item.isAvailable));
      setCategories(menuCategories);
      setTables(allTables);

      if (!tableId) {
        setError("Selecciona una mesa desde el listado de mesas.");
        return;
      }

      // Dine-in table service is tagged WAITER even when an admin operates
      // the screen — OrderSource has no ADMIN value.
      const created = await ordersService.create({
        type: "DINE_IN",
        source: "WAITER",
        tableId,
      });

      setOrder(created);
      setDiscountInput(
        created.discountCents
          ? String(Math.round(created.discountCents / 100))
          : "",
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo abrir la orden"));
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  async function handleConfirmAddItem(quantity: number, notes?: string) {
    if (!order || !pickingItem) return;

    try {
      setBusy(true);
      setError("");
      const updated = await ordersService.addItem(order.id, {
        menuItemId: pickingItem.id,
        quantity,
        notes,
      });
      setOrder(updated);
      setMessage("Producto agregado");
      setPickingItem(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo agregar el producto"));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!order) return;

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
  }

  async function handleChangeQuantity(itemId: string, quantity: number) {
    if (!order || quantity < 1) return;

    try {
      setBusy(true);
      setError("");
      const updated = await ordersService.updateItem(order.id, itemId, {
        quantity,
      });
      setOrder(updated);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo actualizar la cantidad"));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleCourtesy(itemId: string, next: boolean) {
    if (!order) return;

    try {
      setBusy(true);
      setError("");
      const updated = await ordersService.updateItem(order.id, itemId, {
        isComplimentary: next,
      });
      setOrder(updated);
      setMessage(next ? "Ítem marcado como cortesía" : "Cortesía quitada");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo actualizar la cortesía"));
    } finally {
      setBusy(false);
    }
  }

  async function handleApplyDiscount() {
    if (!order) return;
    const pesos = Number(discountInput.replace(",", "."));
    const discountCents = Number.isFinite(pesos)
      ? Math.max(0, Math.round(pesos * 100))
      : 0;

    try {
      setBusy(true);
      setError("");
      const updated = await ordersService.setDiscount(order.id, discountCents);
      setOrder(updated);
      setDiscountInput(
        updated.discountCents
          ? String(Math.round(updated.discountCents / 100))
          : "",
      );
      setMessage("Descuento aplicado");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo aplicar el descuento"));
    } finally {
      setBusy(false);
    }
  }

  async function handleSendToKitchen() {
    if (!order) return;

    if (!order.items?.length) {
      setError("Agrega al menos un producto antes de enviar a cocina");
      return;
    }

    try {
      setBusy(true);
      setError("");

      if (order.status === "CREATED") {
        const updated = await ordersService.updateStatus(
          order.id,
          "SENT_TO_KITCHEN",
        );
        setOrder(updated);
        setMessage(
          skipPrint
            ? "Orden enviada a cocina (sin imprimir)"
            : "Orden enviada a cocina",
        );
      } else {
        setMessage(
          skipPrint ? "Comanda lista (sin imprimir)" : "Comanda lista para imprimir",
        );
      }

      if (!skipPrint) {
        setTicketOpen(true);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo enviar a cocina"));
    } finally {
      setBusy(false);
    }
  }

  async function handleTransferTable(newTableId: string) {
    if (!order) return;

    try {
      setBusy(true);
      setError("");
      const updated = await ordersService.transferTable(order.id, newTableId);
      setOrder(updated);
      setMessage(`Orden movida a mesa ${updated.table?.label ?? ""}`);
      setTransferOpen(false);
      router.replace(`${createOrderPath}?tableId=${newTableId}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo transferir la mesa"));
    } finally {
      setBusy(false);
    }
  }

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
      router.push(tablesHref);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cerrar/cobrar la orden"));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelOrder() {
    if (!order) return;
    if (!window.confirm("¿Cancelar esta orden? No se cobrará.")) return;

    try {
      setBusy(true);
      setError("");
      await ordersService.updateStatus(order.id, "CANCELED");
      setMessage("Orden cancelada");
      router.push(tablesHref);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cancelar la orden"));
    } finally {
      setBusy(false);
    }
  }

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory =
        !categoryFilter || item.categoryId === categoryFilter;
      const matchesSearch =
        !query || item.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [items, search, categoryFilter]);

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const canEditLines = Boolean(order) && order?.status === "CREATED";
  const canAddItems =
    !!order &&
    order.status !== "CLOSED" &&
    order.status !== "CANCELED";
  const canCharge =
    !!order &&
    order.status !== "CLOSED" &&
    order.status !== "CANCELED" &&
    (order?.items?.length ?? 0) > 0 &&
    order.totalCents > 0 &&
    (role === "admin" || hasPermission(currentUser, "ORDERS_CLOSE_PAY"));
  const canCancelOrder =
    !!order &&
    order.status !== "CLOSED" &&
    order.status !== "CANCELED" &&
    (role === "admin" || hasPermission(currentUser, "ORDERS_CANCEL"));
  const canApplyDiscount =
    !!order &&
    order.status !== "CLOSED" &&
    order.status !== "CANCELED" &&
    (role === "admin" || hasPermission(currentUser, "ORDERS_DISCOUNT"));
  const kitchenButtonLabel =
    order?.status === "CREATED" ? "Enviar a cocina" : "Imprimir comanda";

  if (loading) {
    return <main className="p-8">Abriendo orden...</main>;
  }

  return (
    <>
      <main className="mx-auto grid max-w-6xl gap-6 overflow-x-hidden p-4 sm:gap-8 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] print:hidden">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">Tomar orden</h1>
              <p className="text-zinc-400">
                Mesa {order?.table?.label ?? "—"} · Orden #
                {order?.orderNumber ?? "—"} · {order?.status ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {order && !!order.items?.length && (
                <button
                  type="button"
                  onClick={() => setTicketOpen(true)}
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  Ver comanda
                </button>
              )}
              {order && order.status !== "CLOSED" && (
                <button
                  type="button"
                  onClick={() => setTransferOpen(true)}
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  Transferir mesa
                </button>
              )}
              <Link href={tablesHref} className="text-zinc-400 hover:text-white">
                ← Mesas
              </Link>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-emerald-400">{message}</p>}

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm"
          />

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter(null)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  categoryFilter === null
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 text-zinc-300 hover:border-white"
                }`}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryFilter(category.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    categoryFilter === category.id
                      ? "border-white bg-white text-black"
                      : "border-zinc-700 text-zinc-300 hover:border-white"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: categoryColor(category.name) }}
                    aria-hidden="true"
                  />
                  {category.name}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredItems.map((item) => {
              const category = categoryById.get(item.categoryId);
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={busy || !canAddItems}
                  onClick={() => setPickingItem(item)}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-white disabled:opacity-50"
                >
                  {category && (
                    <span
                      className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                      style={{ backgroundColor: categoryColor(category.name) }}
                    >
                      {category.name}
                    </span>
                  )}
                  <h2 className="text-lg font-bold">{item.name}</h2>
                  <p className="mt-1 text-zinc-400">
                    {formatCents(item.priceCents)}
                  </p>
                </button>
              );
            })}
          </div>

          {items.length === 0 && (
            <p className="text-zinc-400">
              No hay productos disponibles. El admin debe crear el menú.
            </p>
          )}
          {items.length > 0 && filteredItems.length === 0 && (
            <p className="text-zinc-400">
              Ningún producto coincide con la búsqueda/filtro.
            </p>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold">Resumen</h2>
          {currentUser && (
            <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
              Atendido por: {currentUser.fullName}
            </p>
          )}

          <ul className="mt-4 space-y-3">
            {(order?.items ?? []).map((line) => (
              <li
                key={line.id}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p>
                    {orderLineLabel(line)} · {formatCents(line.unitPriceCents)}
                    {line.isComplimentary ? (
                      <span className="ml-2 text-[10px] font-bold uppercase text-amber-400">
                        Cortesía
                      </span>
                    ) : null}
                  </p>
                  {line.notes && (
                    <p className="mt-0.5 text-xs italic text-zinc-500">
                      &quot;{line.notes}&quot;
                    </p>
                  )}
                  {canEditLines && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy || line.quantity <= 1}
                        onClick={() =>
                          handleChangeQuantity(line.id, line.quantity - 1)
                        }
                        className="h-7 w-7 rounded-lg border border-zinc-700 text-sm disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-bold">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleChangeQuantity(line.id, line.quantity + 1)
                        }
                        className="h-7 w-7 rounded-lg border border-zinc-700 text-sm disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  )}
                  {canApplyDiscount && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleToggleCourtesy(line.id, !line.isComplimentary)
                      }
                      className="mt-1 text-xs text-amber-400/90 hover:text-amber-300 disabled:opacity-40"
                    >
                      {line.isComplimentary
                        ? "Quitar cortesía"
                        : "Marcar cortesía"}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span>
                    {line.isComplimentary
                      ? formatCents(0)
                      : formatCents(line.lineTotalCents)}
                  </span>
                  {canEditLines && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleRemoveItem(line.id)}
                      title="Quitar producto"
                      className="text-zinc-500 hover:text-red-400 disabled:opacity-40"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {!order?.items?.length && (
            <p className="mt-4 text-sm text-zinc-500">Sin productos aún</p>
          )}

          <div className="mt-6 space-y-2 border-t border-zinc-800 pt-4">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal</span>
              <span>{formatCents(order?.subtotalCents ?? 0)}</span>
            </div>
            {(order?.discountCents ?? 0) > 0 && (
              <div className="flex justify-between text-sm text-amber-400">
                <span>Descuento</span>
                <span>-{formatCents(order?.discountCents ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCents(order?.totalCents ?? 0)}</span>
            </div>
          </div>

          {canApplyDiscount && (
            <div className="mt-4 flex gap-2">
              <input
                type="number"
                min={0}
                step={1}
                value={discountInput}
                disabled={busy}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="Descuento ($)"
                className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleApplyDiscount}
                className="rounded-xl border border-zinc-600 px-3 py-2 text-sm font-semibold hover:bg-zinc-900 disabled:opacity-40"
              >
                Aplicar
              </button>
            </div>
          )}

          <label className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={skipPrint}
              onChange={(e) => setSkipPrint(e.target.checked)}
              className="rounded border-zinc-600"
            />
            No imprimir comanda
          </label>

          <button
            type="button"
            disabled={
              busy ||
              !order ||
              !order.items?.length ||
              order.status === "CLOSED" ||
              order.status === "CANCELED"
            }
            onClick={handleSendToKitchen}
            className="mt-3 w-full rounded-xl bg-white py-3 font-bold text-black disabled:opacity-40"
          >
            {kitchenButtonLabel}
          </button>

          {canCharge && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setPayOpen(true)}
              className="mt-3 w-full rounded-xl border border-emerald-500/50 py-3 font-bold text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-40"
            >
              Cerrar y cobrar
            </button>
          )}

          {canCancelOrder && (
            <button
              type="button"
              disabled={busy}
              onClick={handleCancelOrder}
              className="mt-2 w-full rounded-xl border border-red-500/40 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
            >
              Cancelar orden
            </button>
          )}
        </aside>

        <TransferTableModal
          open={transferOpen}
          tables={tables}
          currentTableId={order?.table?.id}
          busy={busy}
          onClose={() => setTransferOpen(false)}
          onConfirm={handleTransferTable}
        />

        <AddItemModal
          item={pickingItem}
          busy={busy}
          onClose={() => setPickingItem(null)}
          onConfirm={handleConfirmAddItem}
        />

        <ClosePayModal
          open={payOpen}
          totalCents={order?.totalCents ?? 0}
          busy={busy}
          onClose={() => setPayOpen(false)}
          onConfirm={handleCloseAndPay}
        />
      </main>

      {order && ticketOpen && (
        <KitchenTicket order={order} onClose={() => setTicketOpen(false)} />
      )}
    </>
  );
}
