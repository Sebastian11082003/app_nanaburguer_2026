import { AuthUser, UserRole, hasPermission } from "@/src/types/auth";

export type PosNavKey =
  | "dashboard"
  | "sell"
  | "sales"
  | "receipts"
  | "products"
  | "delivery"
  | "kitchen"
  | "cash"
  | "reports"
  | "settings";

export interface PosNavItem {
  key: PosNavKey;
  label: string;
  href: string;
}

/**
 * Shared POS chrome: everyone lands on the same floor.
 * Role sets the default station map; assigned permissions can add modules (HU-032).
 *
 * Mesas = occupancy board. Vender = counter/pickup (not a second copy of
 * the floor). Waiters sell by tapping a table, so they do not get Vender
 * unless they are granted ORDERS_CLOSE_PAY.
 */
const ALL_NAV: PosNavItem[] = [
  { key: "dashboard", label: "Mesas", href: "/restaurant/app" },
  { key: "sell", label: "Vender", href: "/restaurant/cashier/pos" },
  { key: "sales", label: "Ventas", href: "/restaurant/cashier/orders" },
  { key: "receipts", label: "Recibos", href: "/restaurant/cashier/invoices" },
  { key: "products", label: "Productos", href: "/restaurant/admin/menu/items" },
  { key: "delivery", label: "Domicilios", href: "/restaurant/delivery/orders" },
  { key: "kitchen", label: "Cocina", href: "/restaurant/app/kitchen" },
  { key: "cash", label: "Caja", href: "/restaurant/cashier/cash" },
  { key: "reports", label: "Reportes", href: "/restaurant/admin/reports" },
  { key: "settings", label: "Configuración", href: "/restaurant/admin/settings" },
];

const VISIBLE: Record<UserRole, PosNavKey[]> = {
  ADMIN: [
    "dashboard",
    "sell",
    "sales",
    "receipts",
    "products",
    "delivery",
    "kitchen",
    "cash",
    "reports",
    "settings",
  ],
  CASHIER: [
    "dashboard",
    "sell",
    "sales",
    "receipts",
    "delivery",
    "kitchen",
    "cash",
  ],
  WAITER: ["dashboard"],
  DELIVERY: ["delivery"],
  KITCHEN: [],
};

/** POS tabs that a station can gain without changing UserRole. */
const EXTRA_NAV: Array<{ code: string; key: PosNavKey }> = [
  { code: "ORDERS_CLOSE_PAY", key: "sell" },
  { code: "INVOICES_VIEW", key: "receipts" },
  { code: "DELIVERY_MANAGE", key: "delivery" },
  { code: "KITCHEN_OPERATE", key: "kitchen" },
  { code: "CASH_MANAGE", key: "cash" },
];

function decorateHrefs(item: PosNavItem, role: UserRole): PosNavItem {
  if (item.key === "delivery" && (role === "CASHIER" || role === "ADMIN")) {
    return { ...item, href: "/restaurant/cashier/delivery" };
  }
  if (item.key === "delivery" && role === "DELIVERY") {
    return { ...item, href: "/restaurant/delivery/active" };
  }
  if (item.key === "delivery" && role === "WAITER") {
    return { ...item, href: "/restaurant/cashier/delivery" };
  }
  if (item.key === "sales" && role === "ADMIN") {
    return { ...item, href: "/restaurant/admin/orders" };
  }
  return item;
}

export function posNavForRole(role: UserRole | null | undefined): PosNavItem[] {
  if (!role) return [];
  return posNavForUser({
    id: "",
    email: "",
    fullName: "",
    role,
  });
}

export function posNavForUser(user: AuthUser | null | undefined): PosNavItem[] {
  if (!user?.role) return [];
  const role = user.role;
  if (role === "ADMIN") {
    return ALL_NAV.map((item) => decorateHrefs(item, role));
  }

  const allowed = new Set(VISIBLE[role]);
  for (const extra of EXTRA_NAV) {
    if (hasPermission(user, extra.code)) {
      allowed.add(extra.key);
    }
  }

  if (role === "DELIVERY") {
    allowed.delete("dashboard");
    allowed.delete("sell");
    allowed.delete("kitchen");
  }

  return ALL_NAV.filter((item) => allowed.has(item.key)).map((item) =>
    decorateHrefs(item, role),
  );
}

/** Which tab is current — Mesas also covers an open table ticket. */
export function isPosNavActive(item: PosNavItem, pathname: string): boolean {
  if (item.key === "dashboard") {
    return (
      pathname === "/restaurant/app" ||
      pathname.includes("/create-order") ||
      pathname.startsWith("/restaurant/waiter/tables")
    );
  }
  if (item.key === "receipts") {
    return pathname.startsWith("/restaurant/cashier/invoices");
  }
  if (item.key === "delivery") {
    return (
      pathname.startsWith("/restaurant/delivery/orders") ||
      pathname.startsWith("/restaurant/delivery/active") ||
      pathname.startsWith("/restaurant/cashier/delivery")
    );
  }
  if (item.key === "kitchen") {
    return (
      pathname.startsWith("/restaurant/app/kitchen") ||
      pathname.startsWith("/restaurant/kitchen")
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Floor tickets stay in the POS shell. Admin tables still use admin/create-order. */
export function tableOrderHref(): string {
  return "/restaurant/waiter/create-order";
}

export function canOpenTable(role: UserRole | null | undefined): boolean {
  return role === "ADMIN" || role === "CASHIER" || role === "WAITER";
}

export function pickupHref(user: AuthUser | UserRole | null | undefined): string | null {
  const role = typeof user === "string" ? user : user?.role;
  if (role === "CASHIER" || role === "ADMIN") return "/restaurant/cashier/pos";
  if (typeof user === "object" && user && hasPermission(user, "ORDERS_CLOSE_PAY")) {
    return "/restaurant/cashier/pos";
  }
  return null;
}

export function deliveryHref(
  user: AuthUser | UserRole | null | undefined,
): string | null {
  const role = typeof user === "string" ? user : user?.role;
  if (role === "CASHIER" || role === "ADMIN") {
    return "/restaurant/cashier/delivery";
  }
  if (role === "DELIVERY") return "/restaurant/delivery/active";
  if (typeof user === "object" && user && hasPermission(user, "DELIVERY_MANAGE")) {
    return "/restaurant/cashier/delivery";
  }
  return null;
}

export function canAccessPosStation(
  user: AuthUser | null | undefined,
  station: "floor" | "cashier" | "waiter" | "delivery",
): boolean {
  if (!user?.role) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "DELIVERY") return station === "delivery";
  if (user.role === "KITCHEN") return false;
  if (station === "floor" || station === "waiter") {
    return user.role === "CASHIER" || user.role === "WAITER";
  }
  if (station === "cashier") {
    if (user.role === "CASHIER") return true;
    return (
      hasPermission(user, "CASH_MANAGE") ||
      hasPermission(user, "INVOICES_VIEW") ||
      hasPermission(user, "ORDERS_CLOSE_PAY") ||
      hasPermission(user, "DELIVERY_MANAGE")
    );
  }
  if (station === "delivery") {
    return (
      user.role === "CASHIER" || hasPermission(user, "DELIVERY_MANAGE")
    );
  }
  return false;
}
