import { UserRole } from '@prisma/client';

/**
 * Default station logins created with the tenant. Emails are
 * `{prefix}@{slug}.test` so two restaurants never collide (User.email
 * is globally unique). Password is the one the operator just chose
 * for the restaurant admin — they change it later from Usuarios.
 */
export const STATION_STAFF: Array<{
  role: UserRole;
  prefix: string;
  fullName: string;
}> = [
  { role: UserRole.CASHIER, prefix: 'cashier', fullName: 'Cajero' },
  { role: UserRole.WAITER, prefix: 'waiter', fullName: 'Mesero' },
  { role: UserRole.KITCHEN, prefix: 'kitchen', fullName: 'Cocina' },
  { role: UserRole.DELIVERY, prefix: 'delivery', fullName: 'Domicilio' },
];

export function stationStaffEmail(prefix: string, slug: string): string {
  return `${prefix}@${slug}.test`;
}
