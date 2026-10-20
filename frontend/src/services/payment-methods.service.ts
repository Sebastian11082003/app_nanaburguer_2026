import { api } from "@/src/lib/api";
import { PaymentMethod } from "@/src/services/payment.service";

export type RestaurantPaymentMethod = {
  id: string;
  restaurantId: string;
  method: PaymentMethod;
  label: string;
  isActive: boolean;
  sortOrder: number;
};

export type UpdatePaymentMethodPayload = {
  label?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export const paymentMethodsService = {
  async getAll(activeOnly = false): Promise<RestaurantPaymentMethod[]> {
    const { data } = await api.get("/payment-methods", {
      params: activeOnly ? { activeOnly: true } : undefined,
    });
    return data;
  },

  async update(
    id: string,
    payload: UpdatePaymentMethodPayload,
  ): Promise<RestaurantPaymentMethod> {
    const { data } = await api.patch(`/payment-methods/${id}`, payload);
    return data;
  },
};
