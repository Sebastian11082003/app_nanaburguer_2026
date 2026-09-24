import { cashService } from "@/src/services/cash.service";
import { ordersService } from "@/src/services/orders.service";
import {
  CreatePaymentPayload,
  paymentService,
} from "@/src/services/payment.service";

const CASH_SESSION_REQUIRED_ES =
  "Abrí la caja (turno) antes de cobrar o registrar efectivo";

/**
 * Closes the order (creates Sale) and records a single full payment.
 * CASH is checked before close so a rejected cobro does not leave the
 * ticket CLOSED without a payment.
 */
export async function closeAndPayOrder(
  orderId: string,
  payment: Pick<CreatePaymentPayload, "method" | "receivedCents" | "tipCents">,
): Promise<{
  order: Awaited<ReturnType<typeof ordersService.getById>>;
  invoiceId: string | null;
}> {
  if (payment.method === "CASH") {
    const current = await cashService.currentSession();
    if (!current.session) {
      throw new Error(CASH_SESSION_REQUIRED_ES);
    }
  }

  await ordersService.close(orderId);
  const closed = await ordersService.getById(orderId);

  if (!closed.sale?.id) {
    throw new Error("La venta no se creó al cerrar la orden");
  }

  let invoiceId: string | null = null;

  if (!closed.sale.payment) {
    const paid = await paymentService.create(closed.sale.id, {
      method: payment.method,
      amountCents: closed.totalCents,
      tipCents: payment.tipCents ?? 0,
      receivedCents:
        payment.method === "CASH"
          ? (payment.receivedCents ?? closed.totalCents)
          : undefined,
    });
    invoiceId = paid?.invoice?.id ?? null;
  }

  return { order: closed, invoiceId };
}
