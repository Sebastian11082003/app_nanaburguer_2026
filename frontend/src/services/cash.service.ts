import { api } from "@/src/lib/api";

export type CashType = "INCOME" | "EXPENSE";

export type CashMovement = {
  id: string;
  type: CashType;
  concept: string;
  reference: string | null;
  amountCents: number;
  createdAt: string;
  createdBy?: { id: string; fullName: string };
};

export type CreateCashMovementPayload = {
  type: CashType;
  concept: string;
  amountCents: number;
  reference?: string;
};

/** Thin wrapper around `/cash` (ADMIN/CASHIER + CASH_MANAGE). */
export const cashService = {
  async getAll(): Promise<CashMovement[]> {
    const { data } = await api.get("/cash");
    return data;
  },

  async create(payload: CreateCashMovementPayload): Promise<CashMovement> {
    const { data } = await api.post("/cash", payload);
    return data;
  },
};
