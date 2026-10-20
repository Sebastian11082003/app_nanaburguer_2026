/**
 * Shape of the kitchen ESC/POS payload. Kept free of `@/` imports so
 * node:test can load it the same way as staff-auth-expired.
 *
 * Reprint from the KDS is the full ticket (deltaOnly false): a lost slip
 * must show every live line, not only the last round.
 */
export function kitchenJobTitle(deltaOnly?: boolean): string {
  return deltaOnly ? "COMANDA RONDA" : "COMANDA";
}

export type KitchenJobLineInput = {
  quantity: number;
  notes?: string | null;
  canceledAt?: string | null;
  menuItem?: { name: string } | null;
};

export function toKitchenJobLines(items: KitchenJobLineInput[]) {
  return items.map((item) => ({
    qty: item.quantity,
    name: item.menuItem?.name ?? "item",
    notes: item.notes,
    canceled: Boolean(item.canceledAt),
  }));
}
