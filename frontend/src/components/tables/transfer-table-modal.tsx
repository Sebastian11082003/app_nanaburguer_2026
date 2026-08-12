"use client";

import { useMemo, useState } from "react";

import { Table } from "@/src/services/tables.service";

interface Props {
  open: boolean;
  /** All tenant tables (used to offer only tables that are actually free). */
  tables: Table[];
  /** The table the order currently sits on, so it's excluded from the list. */
  currentTableId?: string | null;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (newTableId: string) => Promise<void>;
}

/**
 * Modal used by the waiter to move an open order to a different table
 * (e.g. the host reseats a customer). Only shows tables that are active
 * AND free (`!activeOrder`) — occupied tables are hidden here because the
 * backend would reject the move anyway, so there's no point offering them.
 */
export function TransferTableModal({
  open,
  tables,
  currentTableId,
  busy,
  onClose,
  onConfirm,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>("");

  const availableTables = useMemo(
    () =>
      tables.filter(
        (table) =>
          table.isActive &&
          !table.activeOrder &&
          table.id !== currentTableId,
      ),
    [tables, currentTableId],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <h2 className="font-display text-2xl">Transferir mesa</h2>
        <p className="mt-1 text-sm text-muted">
          Selecciona la mesa destino. Solo se muestran mesas libres.
        </p>

        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {availableTables.map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => setSelectedId(table.id)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                selectedId === table.id
                  ? "border-flame bg-flame/10"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              Mesa {table.label} · {table.capacity} personas
            </button>
          ))}

          {availableTables.length === 0 && (
            <p className="text-sm text-muted">No hay mesas libres disponibles</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-4 py-2 text-sm"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={!selectedId || busy}
            onClick={async () => {
              await onConfirm(selectedId);
              setSelectedId("");
            }}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
          >
            {busy ? "Moviendo..." : "Transferir"}
          </button>
        </div>
      </div>
    </div>
  );
}
