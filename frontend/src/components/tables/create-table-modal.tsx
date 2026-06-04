"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (number: number, capacity: number) => Promise<void>;
}

export function CreateTableModal({ open, onClose, onCreate }: Props) {
  const [number, setNumber] = useState(1);
  const [capacity, setCapacity] = useState(4);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-zinc-950 p-6">
        <h2 className="text-2xl font-bold">Crear Mesa</h2>

        <div className="mt-4 space-y-4">
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
            placeholder="Número"
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
            onClick={onClose}
            className="rounded-xl border border-zinc-700 px-4 py-2"
          >
            Cancelar
          </button>

          <button
            onClick={async () => {
              await onCreate(number, capacity);
              onClose();
            }}
            className="rounded-xl bg-white px-4 py-2 font-bold text-black"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
