"use client";

import { useState } from "react";

import { useTables } from "@/src/hooks/use-tables";

import { TablesGrid } from "@/src/components/tables/table-grid";
import { CreateTableModal } from "@/src/components/tables/create-table-modal";

export default function TablesPage() {
  const [open, setOpen] = useState(false);

  const { tables, loading, createTable } = useTables();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Gestión de Mesas</h1>

          <p className="text-zinc-400">Administra las mesas del restaurante</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="
            rounded-xl
            bg-white
            px-5
            py-3
            font-bold
            text-black
          "
        >
          + Nueva Mesa
        </button>
      </div>

      {loading ? <p>Cargando mesas...</p> : <TablesGrid tables={tables} />}

      <CreateTableModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={async (number, capacity) => {
          await createTable({
            number,
            capacity,
          });
        }}
      />
    </div>
  );
}
