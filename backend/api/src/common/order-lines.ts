/**
 * A ticket line is "live" until canceledAt is set. Occupancy, cobro and
 * kitchen queues must ignore canceled lines so a voided ticket is not
 * treated as a $0 open bill.
 */
export function hasLiveOrderLines(
  items?: Array<{ canceledAt?: Date | string | null }> | null,
): boolean {
  return (items ?? []).some((line) => !line.canceledAt);
}
