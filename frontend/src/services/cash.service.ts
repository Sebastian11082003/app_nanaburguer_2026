import { api } from "@/src/lib/api";

export type CashType = "INCOME" | "EXPENSE";
export type CashSessionStatus = "OPEN" | "CLOSED";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";

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

export type CashActor = { id: string; fullName: string };

export type CashSession = {
  id: string;
  status: CashSessionStatus;
  openedAt: string;
  closedAt: string | null;
  openingCents: number;
  countedCents: number | null;
  notes: string | null;
  salesTotalCents: number | null;
  cashSalesCents: number | null;
  cardSalesCents: number | null;
  transferSalesCents: number | null;
  otherSalesCents: number | null;
  manualIncomeCents: number | null;
  expenseCents: number | null;
  expectedCashCents: number | null;
  differenceCents: number | null;
  openedBy?: CashActor;
  closedBy?: CashActor | null;
};

export type CashSessionPreview = {
  salesTotalCents: number;
  cashSalesCents: number;
  cardSalesCents: number;
  transferSalesCents: number;
  otherSalesCents: number;
  manualIncomeCents: number;
  expenseCents: number;
  expectedCashCents: number;
  byMethod: Array<{
    method: PaymentMethod;
    totalCents: number;
    count: number;
  }>;
};

export type CurrentCashSession = {
  session: CashSession | null;
  preview: CashSessionPreview | null;
};

/** Thin wrapper around `/cash` (ADMIN/CASHIER + CASH_MANAGE). */
export const cashService = {
  async getAll(from?: string): Promise<CashMovement[]> {
    const { data } = await api.get("/cash", {
      params: from ? { from } : undefined,
    });
    return data;
  },

  async create(payload: CreateCashMovementPayload): Promise<CashMovement> {
    const { data } = await api.post("/cash", payload);
    return data;
  },

  async currentSession(): Promise<CurrentCashSession> {
    const { data } = await api.get("/cash/sessions/current");
    return data;
  },

  async listSessions(): Promise<CashSession[]> {
    const { data } = await api.get("/cash/sessions");
    return data;
  },

  async openSession(payload: {
    openingCents: number;
    notes?: string;
  }): Promise<CashSession> {
    const { data } = await api.post("/cash/sessions", payload);
    return data;
  },

  async closeSession(
    id: string,
    payload: { countedCents?: number; notes?: string },
  ): Promise<CashSession> {
    const { data } = await api.post(`/cash/sessions/${id}/close`, payload);
    return data;
  },
};
