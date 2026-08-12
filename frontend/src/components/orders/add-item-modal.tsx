"use client";

import { useState } from "react";

import { formatCents } from "@/src/lib/money";
import { MenuItem } from "@/src/types/menu";

interface Props {
  /** The item being configured before adding it to the order. `null` closes the modal. */
  item: MenuItem | null;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, notes?: string) => Promise<void>;
}

/**
 * Quantity + kitchen-note picker shown before a product is actually added
 * to the order — this is what lets a waiter say "2x Hamburguesa sin
 * cebolla" in a single step instead of clicking "+1" repeatedly and
 * having no way to leave a note for the kitchen.
 *
 * Just a mount/unmount shell: the actual form lives in `AddItemModalForm`,
 * keyed by `item.id` so its quantity/notes state resets for free whenever
 * a DIFFERENT item is picked, without an effect.
 */
export function AddItemModal({ item, busy, onClose, onConfirm }: Props) {
  if (!item) return null;

  return (
    <AddItemModalForm
      key={item.id}
      item={item}
      busy={busy}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

function AddItemModalForm({
  item,
  busy,
  onClose,
  onConfirm,
}: {
  item: MenuItem;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, notes?: string) => Promise<void>;
}) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <h2 className="font-display text-2xl">{item.name}</h2>
        <p className="mt-1 text-sm text-muted">{formatCents(item.priceCents)}</p>

        <div className="mt-5">
          <label className="mb-2 block text-sm text-zinc-400">Cantidad</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-10 w-10 rounded-xl border border-zinc-700 text-lg font-bold hover:bg-zinc-900"
            >
              −
            </button>
            <span className="w-10 text-center text-lg font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="h-10 w-10 rounded-xl border border-zinc-700 text-lg font-bold hover:bg-zinc-900"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm text-zinc-400">
            Observación para la comanda
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ej: sin cebolla, término medio..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-4 py-2 text-sm"
          >
            Cerrar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(quantity, notes.trim() || undefined)}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
          >
            {busy ? "Agregando..." : "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
}
