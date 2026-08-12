import { OrderStatus } from '@prisma/client';

/**
 * Single source of truth for "which order statuses still occupy a table /
 * count as an open order".
 *
 * IMPORTANT: this intentionally excludes both `CLOSED` (paid/finished) and
 * `CANCELED` (voided). Before this constant existed, a couple of places
 * only checked `status !== CLOSED`, which meant a CANCELED order kept
 * "occupying" its table forever and blocked new orders from being created
 * on it. Any code that needs to know "is this table/order still in play"
 * should import this list instead of re-deriving its own status filter.
 */
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.CREATED,
  OrderStatus.SENT_TO_KITCHEN,
  OrderStatus.IN_PREPARATION,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
];
