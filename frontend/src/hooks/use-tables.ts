// src/hooks/use-tables.ts

"use client";

import { useEffect, useState } from "react";

import {
  CreateTableDto,
  Table,
  tablesService,
} from "@/src/services/tables.service";

/**
 * Loads the tenant's tables and keeps them in sync after mutations.
 *
 * Every table returned here includes `activeOrder` (see `Table` type),
 * so consumers can tell "occupied" vs "available" without extra calls.
 */
export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  /** Re-fetches the full table list from the API. */
  async function loadTables() {
    try {
      setLoading(true);
      const data = await tablesService.getAll();
      setTables(data);
    } finally {
      setLoading(false);
    }
  }

  /** Creates a table, then refreshes the list so occupancy stays accurate. */
  async function createTable(data: CreateTableDto) {
    await tablesService.create(data);
    await loadTables();
  }

  useEffect(() => {
    loadTables();
  }, []);

  return {
    tables,
    loading,
    createTable,
    refresh: loadTables,
  };
}
