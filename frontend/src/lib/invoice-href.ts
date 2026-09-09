export function posReceiptHref(invoiceId: string, from?: string): string {
  const path = `/restaurant/cashier/invoices/${invoiceId}`;
  return from ? `${path}?from=${encodeURIComponent(from)}` : path;
}

export function adminReceiptHref(invoiceId: string, from?: string): string {
  const path = `/restaurant/admin/invoices/${invoiceId}`;
  return from ? `${path}?from=${encodeURIComponent(from)}` : path;
}
