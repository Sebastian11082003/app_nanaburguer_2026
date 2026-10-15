import { Order, OrderItem } from "@/src/types/order";

export function isPendingKitchenLine(item: OrderItem): boolean {
  return !item.canceledAt && !item.sentToKitchenAt;
}

export function pendingKitchenLines(order: Order | null | undefined): OrderItem[] {
  if (!order) return [];
  return (order.items ?? []).filter(isPendingKitchenLine);
}

export function latestKitchenSentAt(
  items: OrderItem[] | undefined,
): string | null {
  let latest: string | null = null;
  for (const item of items ?? []) {
    if (!item.sentToKitchenAt || item.canceledAt) continue;
    if (!latest || item.sentToKitchenAt > latest) {
      latest = item.sentToKitchenAt;
    }
  }
  return latest;
}

/** Live lines from the most recent send (comanda delta / KDS "NUEVO"). */
export function latestKitchenRoundLines(order: Order): OrderItem[] {
  const live = (order.items ?? []).filter((item) => !item.canceledAt);
  const latest = latestKitchenSentAt(live);
  if (!latest) return live.filter(isPendingKitchenLine);
  const stamps = new Set(
    live
      .map((item) => item.sentToKitchenAt)
      .filter((stamp): stamp is string => Boolean(stamp)),
  );
  if (stamps.size <= 1) return live.filter((item) => item.sentToKitchenAt);
  return live.filter((item) => item.sentToKitchenAt === latest);
}

export function isLatestKitchenRoundLine(
  item: OrderItem,
  items: OrderItem[] | undefined,
): boolean {
  if (item.canceledAt || !item.sentToKitchenAt) return false;
  const latest = latestKitchenSentAt(items);
  if (!latest) return false;
  const stamps = new Set(
    (items ?? [])
      .filter((row) => !row.canceledAt && row.sentToKitchenAt)
      .map((row) => row.sentToKitchenAt as string),
  );
  return stamps.size > 1 && item.sentToKitchenAt === latest;
}
