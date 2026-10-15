/**
 * Concept written by PaymentsService when a CASH sale hits the drawer.
 * Session totals count those sales from Payment, not from this row —
 * otherwise expected cash would double-count.
 */
export const SALE_PAYMENT_CONCEPT = 'SALE_PAYMENT';

/** CASH payments and manual drawer moves need an OPEN CashSession. */
export const CASH_SESSION_REQUIRED =
  'Open a cash session before recording cash';
