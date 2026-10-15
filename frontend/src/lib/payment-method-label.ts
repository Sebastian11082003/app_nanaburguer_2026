const LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  OTHER: "Otro",
};

export function paymentMethodLabel(method: string) {
  return LABELS[method] ?? method;
}
