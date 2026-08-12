"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the form values when the admin confirms; parent handles the API call. */
  onCreate: (label: string, capacity: number) => Promise<void>;
}

/** Simple modal form for creating a new table (admin only). */
export function CreateTableModal({ open, onClose, onCreate }: Props) {
  const [label, setLabel] = useState("1");
  const [capacity, setCapacity] = useState(4);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-zinc-950 p-6">
        <h2 className="text-2xl font-bold">Crear Mesa</h2>

        <div className="mt-4 space-y-4">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Etiqueta / número"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
          />

          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            placeholder="Capacidad"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 px-4 py-2"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={loading || !label.trim()}
            onClick={async () => {
              try {
                setLoading(true);
                await onCreate(label.trim(), capacity);
                onClose();
              } finally {
                setLoading(false);
              }
            }}
            className="rounded-xl bg-white px-4 py-2 font-bold text-black disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
