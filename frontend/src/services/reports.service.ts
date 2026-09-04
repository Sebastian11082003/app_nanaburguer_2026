import { api } from "@/src/lib/api";

export type PaymentMethodBreakdown = {
  method: string;
  total: number;
  count: number;
};

export type TopProduct = {
  menuItemId: string;
  name: string;
  quantity: number;
};

export type DashboardSnapshot = {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  totalOrders: number;
  activeTables: number;
  deliveriesToday: number;
  topProduct: { name: string; quantity: number } | null;
  paymentMethods: PaymentMethodBreakdown[];
};

export type ReportsSummary = {
  totalRevenue: number;
  totalSales: number;
  totalOrders: number;
};

export type DeliveryReportsSummary = {
  totalDeliveries: number;
  totalRevenue: number;
  payments: { cash: number; card: number; transfer: number };
};

export type SalesByDay = { date: string; total: number };

/** Thin wrapper around `/reports` (ADMIN/CASHIER + REPORTS_VIEW). */
export const reportsService = {
  async dashboard(): Promise<DashboardSnapshot> {
    const { data } = await api.get("/reports/dashboard");
    return data;
  },

  async summary(): Promise<ReportsSummary> {
    const { data } = await api.get("/reports/summary");
    return data;
  },

  async salesByDay(): Promise<SalesByDay[]> {
    const { data } = await api.get("/reports/sales-by-day");
    return data;
  },

  async paymentMethods(): Promise<PaymentMethodBreakdown[]> {
    const { data } = await api.get("/reports/payment-methods");
    return data;
  },

  async topProducts(): Promise<TopProduct[]> {
    const { data } = await api.get("/reports/top-products");
    return data;
  },

  async deliverySummary(): Promise<DeliveryReportsSummary> {
    const { data } = await api.get("/reports/delivery/summary");
    return data;
  },
};
