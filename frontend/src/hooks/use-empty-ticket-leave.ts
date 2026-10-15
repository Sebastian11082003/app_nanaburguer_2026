"use client";

import { useEffect } from "react";

import {
  isEmptyCreatedTicket,
  setEmptyTicketReleaser,
} from "@/src/lib/empty-ticket-leave";
import { Order } from "@/src/types/order";

/** Empty dine-in CREATED tickets: POS nav silently releases the table. */
export function useEmptyTicketLeave(order: Order | null) {
  const orderId = order?.id;
  const empty = isEmptyCreatedTicket(order);

  useEffect(() => {
    setEmptyTicketReleaser(empty && orderId ? orderId : null);
    return () => setEmptyTicketReleaser(null);
  }, [empty, orderId]);
}
