import { PaymentMethod } from '@prisma/client';

/** Built-in methods seeded for every new/existing restaurant. */
export const DEFAULT_PAYMENT_METHODS: {
  method: PaymentMethod;
  label: string;
  sortOrder: number;
}[] = [
  { method: PaymentMethod.CASH, label: 'Efectivo', sortOrder: 0 },
  { method: PaymentMethod.CARD, label: 'Tarjeta', sortOrder: 1 },
  { method: PaymentMethod.TRANSFER, label: 'Transferencia', sortOrder: 2 },
  { method: PaymentMethod.OTHER, label: 'Otro', sortOrder: 3 },
];
