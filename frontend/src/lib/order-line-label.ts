import { OrderItem } from "@/src/types/order";

/**
 * Human-readable label for one order line ("2x Hamburguesa Clásica").
 * Falls back to a generic "item" for older records that don't have the
 * `menuItem` relation populated (e.g. before this field existed).
 */
export function orderLineLabel(item: OrderItem): string {
  const name = item.menuItem?.name ?? "item";
  return `${item.quantity}x ${name}`;
}
