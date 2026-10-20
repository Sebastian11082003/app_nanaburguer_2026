import { api } from "@/src/lib/api";
import { ReportRange } from "@/src/lib/report-range";

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

export type ChannelPayments = { cash: number; card: number; transfer: number };

export type DeliveryReportsSummary = {
  totalDeliveries: number;
  totalPickups: number;
  totalRevenue: number;
  pickupRevenue: number;
  payments: ChannelPayments;
  pickupPayments: ChannelPayments;
};

export type SalesByDay = { date: string; total: number };

export type OrdersByStatus = { status: string; count: number };

function rangeParams(range?: ReportRange) {
  return range ? { from: range.from, to: range.to } : undefined;
}

/** Thin wrapper around `/reports` (ADMIN/CASHIER + REPORTS_VIEW). */
export const reportsService = {
  async dashboard(): Promise<DashboardSnapshot> {
    const { data } = await api.get("/reports/dashboard");
    return data;
  },

  async summary(range?: ReportRange): Promise<ReportsSummary> {
    const { data } = await api.get("/reports/summary", {
      params: rangeParams(range),
    });
    return data;
  },

  async salesByDay(range?: ReportRange): Promise<SalesByDay[]> {
    const { data } = await api.get("/reports/sales-by-day", {
      params: rangeParams(range),
    });
    return data;
  },

  async paymentMethods(
    range?: ReportRange,
  ): Promise<PaymentMethodBreakdown[]> {
    const { data } = await api.get("/reports/payment-methods", {
      params: rangeParams(range),
    });
    return data;
  },

  async topProducts(range?: ReportRange): Promise<TopProduct[]> {
    const { data } = await api.get("/reports/top-products", {
      params: rangeParams(range),
    });
    return data;
  },

  async deliverySummary(range?: ReportRange): Promise<DeliveryReportsSummary> {
    const { data } = await api.get("/reports/delivery/summary", {
      params: rangeParams(range),
    });
    return data;
  },

  async ordersByStatus(range?: ReportRange): Promise<OrdersByStatus[]> {
    const { data } = await api.get("/reports/orders-by-status", {
      params: rangeParams(range),
    });
    return data;
  },
};
