"use client";

import { orderLineLabel } from "@/src/lib/order-line-label";
import { Order } from "@/src/types/order";

interface Props {
  order: Order;
  onClose: () => void;
}

/**
 * Printable kitchen ticket ("comanda") for a DINE_IN/PICKUP order.
 *
 * This is deliberately NOT a receipt/invoice: no prices, no totals, no
 * legal text — just what the kitchen needs (table, order #, items,
 * notes, time). Printing relies on the browser's print dialog pointed at
 * whatever printer is set up near the kitchen (there's no direct
 * thermal-printer/ESC-POS integration here).
 *
 * Everything outside `.comanda-ticket` is expected to carry `print:hidden`
 * in the page that renders this modal, so only the ticket itself ends up
 * on paper.
 */
export function KitchenTicket({ order, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 print:static print:bg-white print:p-0">
      <div className="comanda-ticket w-full max-w-sm rounded-2xl bg-white p-6 text-black print:max-w-none print:rounded-none print:shadow-none">
        <div className="text-center">
          <p className="text-lg font-black uppercase tracking-wide">Comanda</p>
          <p className="text-sm text-zinc-600">
            {new Date().toLocaleString()}
          </p>
        </div>

        <div className="mt-4 border-t border-dashed border-zinc-400 pt-4 text-sm">
          <p className="text-2xl font-black">
            {order.table ? `Mesa ${order.table.label}` : order.type}
          </p>
          <p className="text-zinc-600">Orden #{order.orderNumber}</p>
        </div>

        <ul className="mt-4 space-y-2 border-t border-dashed border-zinc-400 pt-4 text-base">
          {order.items.map((item) => (
            <li key={item.id}>
              <p className="font-bold">{orderLineLabel(item)}</p>
              {item.notes && (
                <p className="text-sm italic text-zinc-600">Nota: {item.notes}</p>
              )}
            </li>
          ))}
        </ul>

        {order.items.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">Sin productos</p>
        )}

        <div className="mt-6 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-300 py-2 text-sm font-semibold"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 rounded-xl bg-black py-2 text-sm font-semibold text-white"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
