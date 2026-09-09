import { ordersService } from "@/src/services/orders.service";
import { Order } from "@/src/types/order";

/**
 * Opening a table creates a CREATED ticket so the floor can lock occupancy.
 * Leaving without items used to keep the card red. Pickup/delivery drafts
 * are different: they already carry the customer and must stay listable so
 * staff can resume them. POS chrome calls `releaseEmptyTicketIfNeeded`
 * before navigating; this module must not cancel on React unmount (Strict
 * Mode would drop a just-opened ticket).
 */
let releaser: (() => Promise<void>) | null = null;

/** CREATED with no live lines — Liberar mesa / Descartar. */
export function isEmptyCreatedDraft(order: Order | null | undefined): boolean {
  return (
    !!order &&
    order.status === "CREATED" &&
    (order.items ?? []).every((line) => line.canceledAt)
  );
}

export function isEmptyCreatedTicket(order: Order | null | undefined): boolean {
  return isEmptyCreatedDraft(order) && order?.type === "DINE_IN";
}

export function clearEmptyTicketReleaser() {
  releaser = null;
}

export function setEmptyTicketReleaser(orderId: string | null) {
  if (!orderId) {
    releaser = null;
    return;
  }
  releaser = async () => {
    await ordersService.updateStatus(orderId, "CANCELED");
  };
}

export async function releaseEmptyTicketIfNeeded() {
  const fn = releaser;
  releaser = null;
  if (!fn) return;
  try {
    await fn();
  } catch {
    // Line items may have landed; keep the ticket occupied.
  }
}
