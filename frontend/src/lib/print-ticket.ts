import { formatPickupAt } from "@/src/lib/format-pickup-at";
import { latestKitchenRoundLines } from "@/src/lib/kitchen-lines";
import { kitchenJobTitle, toKitchenJobLines } from "@/src/lib/kitchen-print-job";
import { orderChannelLabel } from "@/src/lib/order-channel-label";
import {
  KitchenPrintJob,
  ReceiptPrintJob,
  sendPrintJob,
} from "@/src/lib/print-agent";
import { InvoicePrintData } from "@/src/services/invoices.service";
import { Order } from "@/src/types/order";

export async function printKitchenOrder(
  order: Order,
  opts?: { deltaOnly?: boolean; skipBrowser?: boolean },
): Promise<"thermal" | "browser" | "needs-browser"> {
  const lines = opts?.deltaOnly
    ? latestKitchenRoundLines(order)
    : (order.items ?? []);
  const job: KitchenPrintJob = {
    type: "kitchen",
    title: kitchenJobTitle(opts?.deltaOnly),
    channel: orderChannelLabel(order),
    orderNumber: order.orderNumber,
    pickupAt: formatPickupAt(order.pickupAt),
    at: new Date().toLocaleString("es-CO"),
    lines: toKitchenJobLines(lines),
  };
  const sent = await sendPrintJob(job);
  if (sent.ok) return "thermal";
  // KDS reprint must not window.print() the whole board; the caller opens
  // KitchenTicket so only .comanda-ticket hits the browser dialog.
  if (opts?.skipBrowser) return "needs-browser";
  window.print();
  return "browser";
}

export async function printReceipt(
  receipt: InvoicePrintData,
): Promise<"thermal" | "browser"> {
  const job: ReceiptPrintJob = {
    type: "receipt",
    restaurant: receipt.restaurant,
    invoice: {
      number: receipt.invoice.number,
      date: new Date(receipt.invoice.date).toLocaleString("es-CO"),
    },
    order: receipt.order,
    delivery: receipt.delivery,
    items: receipt.items.map((item) => ({
      quantity: item.quantity,
      name: item.name,
      total: item.total,
    })),
    totals: receipt.totals,
    payment: receipt.payment,
    legal: receipt.legal,
  };
  const sent = await sendPrintJob(job);
  if (sent.ok) return "thermal";
  window.print();
  return "browser";
}
