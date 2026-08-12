import { UserRole } from '@prisma/client';

export type PermissionDef = {
  code: string;
  name: string;
  description?: string;
  groupName: string;
};

/** Global permission catalog — codes are stable API/UI contracts. */
export const PERMISSION_CATALOG: PermissionDef[] = [
  {
    code: 'USERS_MANAGE',
    name: 'Gestionar usuarios',
    groupName: 'Personal',
  },
  {
    code: 'ROLES_MANAGE',
    name: 'Gestionar roles y permisos',
    groupName: 'Personal',
  },
  {
    code: 'MENU_MANAGE',
    name: 'Gestionar menú',
    groupName: 'Menú',
  },
  {
    code: 'TABLES_MANAGE',
    name: 'Crear/editar mesas',
    groupName: 'Mesas',
  },
  {
    code: 'TABLES_VIEW',
    name: 'Ver mesas',
    groupName: 'Mesas',
  },
  {
    code: 'RESTAURANT_SETTINGS',
    name: 'Configuración del restaurante',
    groupName: 'Sistema',
  },
  {
    code: 'PAYMENT_METHODS_MANAGE',
    name: 'Configurar métodos de pago',
    groupName: 'Sistema',
  },
  {
    code: 'ORDERS_CREATE',
    name: 'Crear / continuar órdenes',
    groupName: 'Órdenes',
  },
  {
    code: 'ORDERS_VIEW',
    name: 'Ver órdenes',
    groupName: 'Órdenes',
  },
  {
    code: 'ORDERS_EDIT',
    name: 'Editar ítems de orden',
    groupName: 'Órdenes',
  },
  {
    code: 'ORDERS_SEND_KITCHEN',
    name: 'Enviar a cocina',
    groupName: 'Órdenes',
  },
  {
    code: 'ORDERS_TRANSFER',
    name: 'Transferir mesa',
    groupName: 'Órdenes',
  },
  {
    code: 'ORDERS_CANCEL',
    name: 'Cancelar órdenes',
    groupName: 'Órdenes',
  },
  {
    code: 'ORDERS_CLOSE_PAY',
    name: 'Cerrar y cobrar',
    groupName: 'Órdenes',
  },
  {
    code: 'ORDERS_DISCOUNT',
    name: 'Descuentos y cortesías',
    groupName: 'Órdenes',
  },
  {
    code: 'PAYMENTS_CREATE',
    name: 'Registrar pagos',
    groupName: 'Caja',
  },
  {
    code: 'CASH_MANAGE',
    name: 'Movimientos de caja',
    groupName: 'Caja',
  },
  {
    code: 'INVOICES_VIEW',
    name: 'Ver facturas',
    groupName: 'Caja',
  },
  {
    code: 'DELIVERY_MANAGE',
    name: 'Gestionar domicilios (caja)',
    groupName: 'Domicilios',
  },
  {
    code: 'DELIVERY_OPERATE',
    name: 'Operar entregas',
    groupName: 'Domicilios',
  },
  {
    code: 'REPORTS_VIEW',
    name: 'Ver reportes',
    groupName: 'Reportes',
  },
  {
    code: 'KITCHEN_OPERATE',
    name: 'Operar cocina',
    groupName: 'Cocina',
  },
];

const ALL = PERMISSION_CATALOG.map((p) => p.code);

/** Default permission codes for each system station template. */
export const SYSTEM_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ALL,
  CASHIER: [
    'TABLES_VIEW',
    'ORDERS_CREATE',
    'ORDERS_VIEW',
    'ORDERS_EDIT',
    'ORDERS_SEND_KITCHEN',
    'ORDERS_CLOSE_PAY',
    'ORDERS_DISCOUNT',
    'PAYMENTS_CREATE',
    'CASH_MANAGE',
    'INVOICES_VIEW',
    'DELIVERY_MANAGE',
    'REPORTS_VIEW',
  ],
  WAITER: [
    'TABLES_VIEW',
    'ORDERS_CREATE',
    'ORDERS_VIEW',
    'ORDERS_EDIT',
    'ORDERS_SEND_KITCHEN',
    'ORDERS_TRANSFER',
  ],
  KITCHEN: ['ORDERS_VIEW', 'ORDERS_SEND_KITCHEN', 'KITCHEN_OPERATE'],
  DELIVERY: [
    'ORDERS_CREATE',
    'ORDERS_VIEW',
    'ORDERS_EDIT',
    'DELIVERY_OPERATE',
  ],
};

export const SYSTEM_ROLE_META: Record<
  UserRole,
  { name: string; description: string }
> = {
  ADMIN: {
    name: 'Administrador',
    description: 'Acceso completo al panel y a la operación',
  },
  CASHIER: {
    name: 'Cajero',
    description: 'Cobros, caja, facturas y despacho',
  },
  WAITER: {
    name: 'Mesero',
    description: 'Mesas, tomar órdenes y enviar a cocina',
  },
  KITCHEN: {
    name: 'Cocina',
    description: 'Cola de preparación',
  },
  DELIVERY: {
    name: 'Domicilio',
    description: 'Pedidos a domicilio y entregas',
  },
};
