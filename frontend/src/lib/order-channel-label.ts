import { Order } from "@/src/types/order";

type ChannelOrder = Pick<Order, "type" | "status"> & {
  table?: { label: string } | null;
  delivery?: { customerName: string; status?: string } | null;
};

/**
 * Cashier Ventas listed every off-floor ticket as "Mesa —", so a pickup
 * and a domicilio looked the same when charging leftovers.
 */
export function orderChannelLabel(order: ChannelOrder): string {
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

/**
 * Rider progress wins over kitchen: a dispatched ticket is En camino
 * even if the order is still SENT_TO_KITCHEN.
 */
export function orderProgressLabel(order: ChannelOrder): string | null {
  if (order.status === "CLOSED" || order.status === "CANCELED") {
    return null;
  }
  if (order.delivery?.status === "DELIVERED") return "Entregado";
  if (order.delivery?.status === "DISPATCHED") return "En camino";
  if (order.status === "READY") return "Listo";
  if (
    order.status === "SENT_TO_KITCHEN" ||
    order.status === "IN_PREPARATION"
  ) {
    return "En cocina";
  }
  return null;
}

export function orderQueueLabel(order: ChannelOrder): string {
  const channel = orderChannelLabel(order);
  const progress = orderProgressLabel(order);
  return progress ? `${channel} · ${progress}` : channel;
}
