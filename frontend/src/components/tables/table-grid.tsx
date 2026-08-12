"use client";

import { Table } from "@/src/services/tables.service";
import { TableCard } from "./table-card";

interface Props {
  tables: Table[];
  onSelect?: (table: Table) => void;
  onManage?: (table: Table) => void;
}

/** Simple responsive grid of `TableCard`s. Selection logic lives in the caller. */
export function TablesGrid({ tables, onSelect, onManage }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={() => onSelect?.(table)}
          onManage={onManage ? () => onManage(table) : undefined}
        />
      ))}
    </div>
  );
}
