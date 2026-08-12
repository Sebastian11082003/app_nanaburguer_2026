"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CreateTableModal } from "@/src/components/tables/create-table-modal";
import { TablesGrid } from "@/src/components/tables/table-grid";
import { useTables } from "@/src/hooks/use-tables";
import { Table } from "@/src/services/tables.service";

/**
 * Admin tables: tap an active table to take/continue its order (same as
 * waiter). Inactive tables open the management detail for activate/deactivate.
 */
export default function TablesPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { tables, loading, createTable } = useTables();

  function handleSelect(table: Table) {
    if (!table.isActive) {
      router.push(`/restaurant/admin/tables/${table.id}`);
      return;
    }
    router.push(`/restaurant/admin/create-order?tableId=${table.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Gestión de Mesas</h1>
          <p className="text-zinc-400">
            Toca una mesa activa para tomar o continuar su orden. Las
            inactivas abren la configuración.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-xl bg-white px-5 py-3 font-bold text-black"
        >
          + Nueva Mesa
        </button>
      </div>

      {loading ? (
        <p>Cargando mesas...</p>
      ) : (
        <TablesGrid
          tables={tables}
          onSelect={handleSelect}
          onManage={(table) =>
            router.push(`/restaurant/admin/tables/${table.id}`)
          }
        />
      )}

      <CreateTableModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={async (label, capacity) => {
          await createTable({ label, capacity });
        }}
      />
    </div>
  );
}
