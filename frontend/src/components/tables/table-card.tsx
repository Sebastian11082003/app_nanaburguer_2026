"use client";

import { Table } from "@/src/services/tables.service";

interface Props {
  table: Table;
  onClick?: () => void;
}

export function TableCard({ table, onClick }: Props) {
  const statusColor = {
    AVAILABLE: "bg-zinc-600",
    OCCUPIED: "bg-green-600",
    PAYMENT_PENDING: "bg-red-600",
  };

  const statusLabel = {
    AVAILABLE: "Disponible",
    OCCUPIED: "Ocupada",
    PAYMENT_PENDING: "Facturando",
  };

  return (
    <button
      onClick={onClick}
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
        p-5
        text-left
        transition
        hover:border-white
      "
    >
      <h2 className="text-2xl font-bold">Mesa {table.number}</h2>

      <p className="text-zinc-400">{table.capacity} personas</p>

      <div className="mt-4">
        <span
          className={`
            rounded-full
            px-3
            py-1
            text-sm
            ${statusColor[table.status]}
          `}
        >
          {statusLabel[table.status]}
        </span>
      </div>
    </button>
  );
}
