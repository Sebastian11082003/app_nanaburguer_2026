// src/hooks/use-tables.ts

"use client";

import { useEffect, useState } from "react";

import {
  Table,
  CreateTableDto,
  tablesService,
} from "@/src/services/tables.service";

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTables() {
    try {
      setLoading(true);

      const data = await tablesService.getAll();

      setTables(data);
    } finally {
      setLoading(false);
    }
  }

  async function createTable(data: CreateTableDto) {
    await tablesService.create(data);

    await loadTables();
  }

  async function deleteTable(id: string) {
    await tablesService.remove(id);

    await loadTables();
  }

  useEffect(() => {
    loadTables();
  }, []);

  return {
    tables,
    loading,
    createTable,
    deleteTable,
    refresh: loadTables,
  };
}
