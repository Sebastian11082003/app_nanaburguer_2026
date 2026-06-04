// src/services/tables.service.ts

import { api } from "@/src/lib/api";

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "PAYMENT_PENDING";
}

export interface CreateTableDto {
  number: number;
  capacity: number;
}

export const tablesService = {
  async getAll(): Promise<Table[]> {
    const response = await api.get("/tables");
    return response.data;
  },

  async create(data: CreateTableDto): Promise<Table> {
    const response = await api.post("/tables", data);
    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  },
};
