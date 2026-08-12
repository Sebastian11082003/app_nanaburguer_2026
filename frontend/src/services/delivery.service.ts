import { api } from "@/src/lib/api";
import { DeliveryStatus, Order } from "@/src/types/order";

export interface DeliveryRecord {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  address?: string | null;
  neighborhood?: string | null;
  notes?: string | null;
  status: DeliveryStatus;
  printed: boolean;
  deliveryUserId?: string | null;
  order?: Order;
}

export const deliveryService = {
  async getAll(): Promise<DeliveryRecord[]> {
    const { data } = await api.get("/deliveries");
    return data;
  },

  async getById(id: string): Promise<DeliveryRecord> {
    const { data } = await api.get(`/deliveries/${id}`);
    return data;
  },

  async markPrinted(id: string): Promise<DeliveryRecord> {
    const { data } = await api.patch(`/deliveries/${id}/printed`);
    return data;
  },

  async dispatch(id: string): Promise<DeliveryRecord> {
    const { data } = await api.patch(`/deliveries/${id}/dispatch`);
    return data;
  },

  async deliver(id: string): Promise<DeliveryRecord> {
    const { data } = await api.patch(`/deliveries/${id}/deliver`);
    return data;
  },
};
