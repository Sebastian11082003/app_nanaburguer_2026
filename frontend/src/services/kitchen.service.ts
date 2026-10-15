import { ordersService } from "@/src/services/orders.service";
import { OrderStatus } from "@/src/types/order";

/** Thin facade over orders API for kitchen views. */
export const kitchenService = {
  listByStatus(status: OrderStatus) {
    return ordersService.getAll({ status });
  },

  updateStatus(orderId: string, status: OrderStatus) {
    return ordersService.updateStatus(orderId, status);
  },
};
