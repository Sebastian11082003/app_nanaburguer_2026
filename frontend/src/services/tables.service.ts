import { api } from "@/src/lib/api";
import { Order } from "@/src/types/order";

/**
 * A restaurant table.
 *
 * `activeOrder` is populated by the backend (`TablesService`) from the
 * table's current non-closed/non-canceled order, if any. It is the single
 * source of truth for whether a table is "occupied": there is no separate
 * status field to keep in sync, so always derive occupancy from this
 * (`Boolean(table.activeOrder)`) instead of guessing from `isActive`,
 * which only means "this table exists / is in service".
 */
export interface Table {
  id: string;
  label: string;
  capacity: number;
  isActive: boolean;
  activeOrder: Order | null;
}

export interface CreateTableDto {
  label: string;
  capacity: number;
}

export const tablesService = {
  /** Lists all tables for the current tenant, including occupancy info. */
  async getAll(): Promise<Table[]> {
    const { data } = await api.get("/tables");
    return data;
  },

  /** Fetches a single table with its current active order (if any). */
  async getById(id: string): Promise<Table> {
    const { data } = await api.get(`/tables/${id}`);
    return data;
  },

  async create(payload: CreateTableDto): Promise<Table> {
    const { data } = await api.post("/tables", payload);
    return data;
  },

  async update(
    id: string,
    payload: Partial<CreateTableDto> & { isActive?: boolean },
  ): Promise<Table> {
    const { data } = await api.patch(`/tables/${id}`, payload);
    return data;
  },
};
