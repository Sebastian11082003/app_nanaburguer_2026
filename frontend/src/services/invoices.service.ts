import { api } from "@/src/lib/api";

export type InvoiceStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Invoice {
  id: string;
  saleId: string;
  paymentId: string;
  number: string;
  cufe: string | null;
  status: InvoiceStatus;
  totalCents: number;
  currency: string;
  createdAt: string;
}

/**
 * Printable receipt snapshot stored on the invoice at payment time (see
 * `PaymentsService.buildInvoice` on the backend). This is frozen at the
 * moment of payment — it does NOT reflect later edits to the restaurant,
 * menu, etc, which is intentional for a legal/financial document.
 */
export interface InvoicePrintData {
  restaurant: {
    name: string;
    nit: string;
    phone: string | null;
    address: string | null;
    /** Frozen at payment time — see `PaymentsService.buildInvoice`. */
    logoUrl: string | null;
  };
  invoice: { number: string; date: string };
  order: { number: number; type: string; table: string | null };
  delivery: {
    customerName: string;
    phone: string;
    address: string | null;
    takenAt: string;
    printedAt: string | null;
    dispatchedAt: string | null;
    deliveredAt: string | null;
  } | null;
  staff: { waiter: string | null; cashier: string };
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    notes: string | null;
  }[];
  totals: { subtotal: number; discount?: number; tip: number; total: number };
  payment: {
    method: string;
    /** Tenant display label frozen at payment time (falls back to method). */
    methodLabel?: string;
    received: number | null;
    change: number;
    paidAt: string;
  };
  legal: {
    tipDisclaimer: string;
    tipSuggestedPercent: number;
    tipIsOptional: boolean;
  };
}

/** Thin wrapper around `/invoices` (ADMIN/CASHIER only, enforced by the backend). */
export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    const { data } = await api.get("/invoices");
    return data;
  },

  async getById(id: string): Promise<Invoice> {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  },

  /** Returns the frozen receipt snapshot used to render/print the invoice. */
  async print(id: string): Promise<InvoicePrintData> {
    const { data } = await api.get(`/invoices/${id}/print`);
    return data;
  },

  /** Simulates DIAN acceptance (no real e-invoicing integration yet). */
  async accept(id: string): Promise<Invoice> {
    const { data } = await api.post(`/invoices/${id}/accept`);
    return data;
  },
};
