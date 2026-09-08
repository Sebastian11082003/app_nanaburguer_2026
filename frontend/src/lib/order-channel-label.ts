import { Order } from "@/src/types/order";

/**
 * Cashier Ventas listed every off-floor ticket as "Mesa —", so a pickup
 * and a domicilio looked the same when charging leftovers.
 */
export function orderChannelLabel(
  order: Pick<Order, "type"> & {
    table?: { label: string } | null;
    delivery?: { customerName: string } | null;
  },
): string {
  if (order.table?.label) return `Mesa ${order.table.label}`;
  const who = order.delivery?.customerName?.trim();
  if (order.type === "DELIVERY") {
    return who ? `Domicilio · ${who}` : "Domicilio";
  }
  if (order.type === "PICKUP") {
    return who ? `Llevar · ${who}` : "Llevar";
  }
  return order.type;
}
