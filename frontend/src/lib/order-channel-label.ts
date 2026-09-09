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
 * After the rider leaves, caja still has to cobro. Without this, a
 * READY domicilio looks the same as one still waiting in kitchen.
 */
export function orderQueueLabel(order: ChannelOrder): string {
  const channel = orderChannelLabel(order);
  if (order.status === "CLOSED" || order.status === "CANCELED") {
    return channel;
  }
  if (order.delivery?.status === "DELIVERED") {
    return `${channel} · Entregado`;
  }
  if (order.delivery?.status === "DISPATCHED") {
    return `${channel} · En camino`;
  }
  return channel;
}
