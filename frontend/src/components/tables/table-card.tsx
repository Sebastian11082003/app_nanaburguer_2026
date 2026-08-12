"use client";

import { formatCents } from "@/src/lib/money";
import { Table } from "@/src/services/tables.service";

interface Props {
  table: Table;
  onClick?: () => void;
  /** Optional secondary action (e.g. admin table settings). */
  onManage?: () => void;
}

/**
 * Visual card for a single table.
 *
 * Occupancy is derived purely from `table.activeOrder` (see the `Table`
 * type doc) — never from `isActive`, which only means the table exists
 * and is in service. A table can be `isActive: true` and still be free.
 */
export function TableCard({ table, onClick, onManage }: Props) {
  const isOccupied = Boolean(table.activeOrder);

  const statusLabel = !table.isActive
    ? "Inactiva"
    : isOccupied
      ? `Ocupada · Orden #${table.activeOrder?.orderNumber}`
      : "Disponible";

  const statusColor = !table.isActive
    ? "bg-zinc-700 text-zinc-300"
    : isOccupied
      ? "bg-amber-600 text-black"
      : "bg-emerald-700 text-white";

  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-zinc-950 text-left transition hover:border-flame/40 ${
        !table.isActive ? "opacity-60" : ""
      }`}
    >
      {onManage && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onManage();
          }}
          title="Configurar mesa"
          className="absolute right-3 top-3 z-10 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-900 hover:text-white"
        >
          Config
        </button>
      )}
      <button
        type="button"
        onClick={onClick}
        className="w-full p-5 text-left"
      >
        <h2 className="font-display text-2xl">Mesa {table.label}</h2>
        <p className="text-sm text-muted">{table.capacity} personas</p>

        <div className="mt-4 flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        {isOccupied && (table.activeOrder?.totalCents ?? 0) > 0 && (
          <p className="mt-2 text-sm font-bold text-amber-400">
            {formatCents(table.activeOrder!.totalCents)}
          </p>
        )}
      </button>
    </div>
  );
}
