const LABELS: Record<string, string> = {
  CREATED: "Creada",
  SENT_TO_KITCHEN: "En cocina",
  IN_PREPARATION: "Preparando",
  READY: "Lista",
  OUT_FOR_DELIVERY: "En camino",
  DELIVERED: "Entregada",
  CLOSED: "Cerrada",
  CANCELED: "Cancelada",
};

export function orderStatusLabel(status: string) {
  return LABELS[status] ?? status;
}
