"use client";

import { useRouter } from "next/navigation";

import { Table } from "@/src/services/tables.service";
import { TableCard } from "./table-card";

interface Props {
  tables: Table[];
}

export function TablesGrid({ tables }: Props) {
  const router = useRouter();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={() => router.push(`/restaurant/admin/tables/${table.id}`)}
        />
      ))}
    </div>
  );
}
