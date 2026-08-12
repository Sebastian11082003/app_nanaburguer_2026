import { ordersService } from "@/src/services/orders.service";
import {
  CreatePaymentPayload,
  paymentService,
} from "@/src/services/payment.service";

/**
 * Closes the order (creates Sale) and records a single full payment.
 * Shared by admin/cashier close flows so method/amount stay consistent.
 */
export async function closeAndPayOrder(
  orderId: string,
  payment: Pick<CreatePaymentPayload, "method" | "receivedCents" | "tipCents">,
) {
  await ordersService.close(orderId);
  const closed = await ordersService.getById(orderId);

  if (!closed.sale?.id) {
    throw new Error("La venta no se creó al cerrar la orden");
  }

  if (!closed.sale.payment) {
    await paymentService.create(closed.sale.id, {
      method: payment.method,
      amountCents: closed.totalCents,
      tipCents: payment.tipCents ?? 0,
      receivedCents:
        payment.method === "CASH"
          ? (payment.receivedCents ?? closed.totalCents)
          : undefined,
    });
  }

  return closed;
}
