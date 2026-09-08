"use client";

import { useEffect } from "react";

import {
  isEmptyCreatedTicket,
  setEmptyTicketReleaser,
} from "@/src/lib/empty-ticket-leave";
import { Order } from "@/src/types/order";

/** While the open ticket has no products, POS nav can silently release it. */
export function useEmptyTicketLeave(order: Order | null) {
  const orderId = order?.id;
  const empty = isEmptyCreatedTicket(order);

  useEffect(() => {
    setEmptyTicketReleaser(empty && orderId ? orderId : null);
    return () => setEmptyTicketReleaser(null);
  }, [empty, orderId]);
}
