import { api } from "@/src/lib/api";
import {
  AddItemPayload,
  CreateOrderPayload,
  Order,
  OrderStatus,
} from "@/src/types/order";

export interface FindOrdersParams {
  status?: OrderStatus;
  type?: string;
  tableId?: string;
}

/**
 * Thin wrapper around the `/orders` REST API. Every method maps 1:1 to a
 * backend endpoint in `OrdersController` — keep it that way so the
 * frontend never has to guess request/response shapes independently of
 * the backend DTOs.
 */
export const ordersService = {
  /** Opens a new order, or (for DINE_IN) resumes the table's current one. */
  async create(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post("/orders", payload);
    return data;
  },

  /** Adds one line item to an open order and returns the order with updated totals. */
  async addItem(orderId: string, payload: AddItemPayload): Promise<Order> {
    const { data } = await api.post(`/orders/${orderId}/items`, payload);
    return data;
  },

  /** Edits quantity/notes (CREATED) and/or cortesía. */
  async updateItem(
    orderId: string,
    itemId: string,
    payload: {
      quantity?: number;
      notes?: string;
      isComplimentary?: boolean;
    },
  ): Promise<Order> {
    const { data } = await api.patch(
      `/orders/${orderId}/items/${itemId}`,
      payload,
    );
    return data;
  },

  /** Order-level discount in cents (ADMIN/CASHIER). */
  async setDiscount(orderId: string, discountCents: number): Promise<Order> {
    const { data } = await api.patch(`/orders/${orderId}/discount`, {
      discountCents,
    });
    return data;
  },

  /** Removes a line item — only allowed while the order hasn't been sent to kitchen yet (status CREATED). */
  async removeItem(orderId: string, itemId: string): Promise<Order> {
    const { data } = await api.delete(`/orders/${orderId}/items/${itemId}`);
    return data;
  },

  /** Advances (or otherwise changes) the order's kitchen/lifecycle status. */
  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status });
    return data;
  },

  /**
   * Reassigns a DINE_IN order to a different table (e.g. host reseats a
   * customer). The backend rejects the move if the destination table is
   * inactive or already has a different active order on it.
   */
  async transferTable(orderId: string, newTableId: string): Promise<Order> {
    const { data } = await api.patch(`/orders/${orderId}/transfer`, {
      newTableId,
    });
    return data;
  },

  /** Closes the order (frees its table) and creates the linked Sale for payment. */
  async close(orderId: string): Promise<Order> {
    const { data } = await api.patch(`/orders/${orderId}/close`);
    return data;
  },

  async getAll(params?: FindOrdersParams): Promise<Order[]> {
    const { data } = await api.get("/orders", { params });
    return data;
  },

  async getById(orderId: string): Promise<Order> {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },
};
