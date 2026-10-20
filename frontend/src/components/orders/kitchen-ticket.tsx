"use client";

import { useState } from "react";

import { orderChannelLabel } from "@/src/lib/order-channel-label";
import { orderLineLabel } from "@/src/lib/order-line-label";
import { formatPickupAt } from "@/src/lib/format-pickup-at";
import { latestKitchenRoundLines } from "@/src/lib/kitchen-lines";
import { printKitchenOrder } from "@/src/lib/print-ticket";
import { Order } from "@/src/types/order";

interface Props {
  order: Order;
  onClose: () => void;
  /** After Enviar a cocina: only the latest round (delta). */
  deltaOnly?: boolean;
}

/**
 * Printable kitchen ticket ("comanda") for dine-in, pickup or delivery.
 *
 * This is deliberately NOT a receipt/invoice: no prices, no totals, no
 * legal text — just what the kitchen needs (table, order #, items,
 * notes, time). Imprimir manda ESC/POS al print-agent local (USB/red).
 * Si el agente no está, abre el diálogo del navegador en 80mm.
 *
 * Everything outside `.comanda-ticket` is expected to carry `print:hidden`
 * in the page that renders this modal, so only the ticket itself ends up
 * on paper.
 */
export function KitchenTicket({ order, onClose, deltaOnly = false }: Props) {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const lines = deltaOnly
    ? latestKitchenRoundLines(order)
    : (order.items ?? []);
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] print:static print:bg-white print:p-0 sm:items-center">
      <div className="comanda-ticket w-full max-w-sm rounded-t-2xl bg-white p-6 text-black print:max-w-none print:rounded-none print:shadow-none sm:rounded-2xl">
        <div className="text-center">
          <p className="text-lg font-black uppercase tracking-wide">
            {deltaOnly ? "Comanda · ronda" : "Comanda"}
          </p>
          <p className="text-sm text-zinc-600">
            {new Date().toLocaleString()}
          </p>
        </div>

        <div className="mt-4 border-t border-dashed border-zinc-400 pt-4 text-sm">
          <p className="text-2xl font-black">
            {orderChannelLabel(order)}
          </p>
          <p className="text-zinc-600">Orden #{order.orderNumber}</p>
          {formatPickupAt(order.pickupAt) ? (
            <p className="font-semibold">Recoge {formatPickupAt(order.pickupAt)}</p>
          ) : null}
        </div>

        <ul className="mt-4 space-y-2 border-t border-dashed border-zinc-400 pt-4 text-base">
          {lines.map((item) => (
            <li key={item.id}>
              <p
                className={
                  item.canceledAt ? "font-bold text-zinc-400 line-through" : "font-bold"
                }
              >
                {item.canceledAt ? "CANCELADO · " : ""}
                {orderLineLabel(item)}
              </p>
              {item.notes && !item.canceledAt && (
                <p className="text-sm italic text-zinc-600">Nota: {item.notes}</p>
              )}
            </li>
          ))}
        </ul>

        {lines.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">Sin productos</p>
        )}

        <div className="mt-6 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-xl border border-zinc-300 py-2 text-sm font-semibold"
          >
            Cerrar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const mode = await printKitchenOrder(order, { deltaOnly });
              setBusy(false);
              setHint(
                mode === "thermal"
                  ? "Enviado a la térmica"
                  : "Elige la impresora térmica en el diálogo",
              );
            }}
            className="min-h-11 flex-1 rounded-xl bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Imprimiendo..." : "Imprimir"}
          </button>
        </div>
        {hint ? (
          <p className="mt-3 text-center text-xs text-zinc-500 print:hidden">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
