"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { TablesGrid } from "@/src/components/tables/table-grid";
import { useTables } from "@/src/hooks/use-tables";
import { Table } from "@/src/services/tables.service";

/**
 * Waiter's table picker.
 *
 * Tapping ANY active table (occupied or free) routes to the same
 * "create-order" screen with `?tableId=<id>`: for a free table it opens a
 * brand new order; for an occupied one, the backend's dedupe logic in
 * `OrdersService.create` returns the SAME order instead of creating a
 * duplicate, so the waiter transparently resumes it (e.g. to add items).
 */
export default function WaiterTablesPage() {
  const router = useRouter();
  const { tables, loading } = useTables();

  function handleSelect(table: Table) {
    router.push(`/restaurant/waiter/create-order?tableId=${table.id}`);
  }

  return (
    <main className="brand-atmosphere min-h-screen px-6 py-10 text-paper">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-flame">
              Mesero
            </p>
            <h1 className="mt-2 font-display text-4xl">Mesas</h1>
            <p className="mt-2 text-muted">
              Toca una mesa libre para abrir orden, u ocupada para continuarla.
            </p>
          </div>
          <Link href="/restaurant/waiter" className="text-sm text-muted hover:text-paper">
            ← Volver
          </Link>
        </div>

        {loading ? (
          <p>Cargando mesas...</p>
        ) : tables.length === 0 ? (
          <p className="text-muted">
            No hay mesas. Un administrador debe crearlas primero.
          </p>
        ) : (
          <TablesGrid
            tables={tables.filter((t) => t.isActive)}
            onSelect={handleSelect}
          />
        )}
      </div>
    </main>
  );
}
