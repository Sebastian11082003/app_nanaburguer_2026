export type OrderType = "DINE_IN" | "DELIVERY" | "PICKUP";
export type OrderSource = "WAITER" | "CASHIER" | "DELIVERY";
export type OrderStatus =
  | "CREATED"
  | "SENT_TO_KITCHEN"
  | "IN_PREPARATION"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CLOSED"
  | "CANCELED";

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  notes?: string | null;
  /** Free of charge — kitchen still prepares; line total is 0. */
  isComplimentary?: boolean;
  /** Product name, so tickets/receipts can show "2x Hamburguesa" instead of "2x item". */
  menuItem?: { name: string } | null;
}

/** Minimal staff info attached to an order — who opened it, who last touched/closed it. */
export interface OrderStaff {
  id: string;
  fullName: string;
  role: string;
}

export interface OrderTable {
  id: string;
  label: string;
  capacity: number;
  isActive: boolean;
}

export interface OrderSale {
  id: string;
  totalCents: number;
  payment?: { id: string } | null;
}

export type DeliveryStatus =
  | "PENDING"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderDelivery {
  id: string;
  customerName: string;
  phone: string;
  address?: string | null;
  neighborhood?: string | null;
  notes?: string | null;
  status: DeliveryStatus;
  printed: boolean;
  deliveryUserId?: string | null;
}

export interface Order {
  id: string;
  orderNumber: number;
  type: OrderType;
  status: OrderStatus;
  source: OrderSource;
  tableId?: string | null;
  subtotalCents: number;
  taxCents: number;
  discountCents?: number;
  totalCents: number;
  items: OrderItem[];
  table?: OrderTable | null;
  sale?: OrderSale | null;
  delivery?: OrderDelivery | null;
  createdAt: string;
  /** Waiter/cashier/etc who opened the order. */
  createdBy?: OrderStaff | null;
  /** Whoever last changed the order — e.g. the cashier who closed/invoiced it. */
  updatedBy?: OrderStaff | null;
}

export interface CreateOrderPayload {
  type: OrderType;
  source: OrderSource;
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  neighborhood?: string;
  paymentMethod?: string;
}

export interface AddItemPayload {
  menuItemId: string;
  quantity: number;
  notes?: string;
}
