import { UserRole } from "@/src/types/auth";

export type PosNavKey =
  | "dashboard"
  | "sell"
  | "sales"
  | "products"
  | "delivery"
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
 * The role only decides which modules are visible.
 *
 * Mesas = occupancy board. Vender = counter/pickup (not a second copy of
 * the floor). Waiters sell by tapping a table, so they do not get Vender.
 */
const ALL_NAV: PosNavItem[] = [
  { key: "dashboard", label: "Mesas", href: "/restaurant/app" },
  { key: "sell", label: "Vender", href: "/restaurant/cashier/pos" },
  { key: "sales", label: "Ventas", href: "/restaurant/admin/orders" },
  { key: "products", label: "Productos", href: "/restaurant/admin/menu/items" },
  { key: "delivery", label: "Domicilios", href: "/restaurant/delivery/orders" },
  { key: "cash", label: "Caja", href: "/restaurant/cashier/cash" },
  { key: "reports", label: "Reportes", href: "/restaurant/admin/reports" },
  { key: "settings", label: "Configuración", href: "/restaurant/admin/settings" },
];

const VISIBLE: Record<UserRole, PosNavKey[]> = {
  ADMIN: [
    "dashboard",
    "sell",
    "sales",
    "products",
    "delivery",
    "cash",
    "reports",
    "settings",
  ],
  CASHIER: ["dashboard", "sell", "sales", "delivery", "cash"],
  WAITER: ["dashboard"],
  DELIVERY: ["dashboard", "delivery"],
  KITCHEN: ["dashboard"],
};

export function posNavForRole(role: UserRole | null | undefined): PosNavItem[] {
  if (!role) return [];
  const allowed = new Set(VISIBLE[role]);
  return ALL_NAV.filter((item) => allowed.has(item.key)).map((item) => {
    if (item.key === "sales" && (role === "CASHIER" || role === "ADMIN")) {
      return { ...item, href: "/restaurant/cashier/orders" };
    }
    if (item.key === "delivery" && (role === "CASHIER" || role === "ADMIN")) {
      return { ...item, href: "/restaurant/cashier/delivery" };
    }
    if (item.key === "delivery" && role === "DELIVERY") {
      return { ...item, href: "/restaurant/delivery/active" };
    }
    return item;
  });
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
  if (item.key === "sell") {
    return pathname.startsWith("/restaurant/cashier/pos");
  }
  if (item.key === "delivery") {
    return (
      pathname.startsWith("/restaurant/delivery/orders") ||
      pathname.startsWith("/restaurant/delivery/active") ||
      pathname.startsWith("/restaurant/cashier/delivery")
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Floor tickets stay in the POS shell. Admin tables still use admin/create-order. */
export function tableOrderHref(_role?: UserRole | null): string {
  return "/restaurant/waiter/create-order";
}

export function canOpenTable(role: UserRole | null | undefined): boolean {
  return role === "ADMIN" || role === "CASHIER" || role === "WAITER";
}

export function pickupHref(role: UserRole | null | undefined): string | null {
  if (role === "CASHIER" || role === "ADMIN") return "/restaurant/cashier/pos";
  if (role === "DELIVERY") return "/restaurant/delivery/orders";
  return null;
}

export function deliveryHref(role: UserRole | null | undefined): string | null {
  if (role === "CASHIER" || role === "ADMIN") {
    return "/restaurant/cashier/delivery";
  }
  if (role === "DELIVERY") return "/restaurant/delivery/active";
  return null;
}
