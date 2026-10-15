import { api } from "@/src/lib/api";

export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";

export interface CreatePaymentPayload {
  method: PaymentMethod;
  amountCents: number;
  tipCents?: number;
  receivedCents?: number;
}

export const paymentService = {
  async create(saleId: string, payload: CreatePaymentPayload): Promise<{
    payment: { id: string };
    changeCents: number;
    invoice?: { id: string } | null;
  }> {
    const { data } = await api.post(`/sales/${saleId}/payments`, payload);
    return data;
  },
};
