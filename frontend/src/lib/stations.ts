import { UserRole } from "@/src/types/auth";

/**
 * One row per operational station. Emails created with the tenant are
 * `{emailPrefix}@{slug}.test` (see backend `STATION_STAFF`).
 */
export interface StationMeta {
  role: UserRole;
  path: "admin" | "cashier" | "waiter" | "kitchen" | "delivery";
  emailPrefix: string;
  label: string;
  loginHref: string;
  homeHref: string;
}

export const STATIONS: StationMeta[] = [
  {
    role: "ADMIN",
    path: "admin",
    emailPrefix: "admin",
    label: "Administrador",
    loginHref: "/restaurant/admin/login",
    homeHref: "/restaurant/admin",
  },
  {
    role: "CASHIER",
    path: "cashier",
    emailPrefix: "cashier",
    label: "Cajero",
    loginHref: "/restaurant/cashier/login",
    homeHref: "/restaurant/cashier",
  },
  {
    role: "WAITER",
    path: "waiter",
    emailPrefix: "waiter",
    label: "Mesero",
    loginHref: "/restaurant/waiter/login",
    homeHref: "/restaurant/waiter",
  },
  {
    role: "KITCHEN",
    path: "kitchen",
    emailPrefix: "kitchen",
    label: "Cocina",
    loginHref: "/restaurant/kitchen/login",
    homeHref: "/restaurant/kitchen",
  },
  {
    role: "DELIVERY",
    path: "delivery",
    emailPrefix: "delivery",
    label: "Delivery",
    loginHref: "/restaurant/delivery/login",
    homeHref: "/restaurant/delivery",
  },
];

export const STATION_BY_ROLE: Record<UserRole, StationMeta> = STATIONS.reduce(
  (acc, station) => {
    acc[station.role] = station;
    return acc;
  },
  {} as Record<UserRole, StationMeta>,
);

export const STATION_BY_PATH: Record<StationMeta["path"], StationMeta> =
  STATIONS.reduce(
    (acc, station) => {
      acc[station.path] = station;
      return acc;
    },
    {} as Record<StationMeta["path"], StationMeta>,
  );

export function stationEmail(prefix: string, slug: string): string {
  return `${prefix}@${slug.trim().toLowerCase()}.test`;
}

export function isStationLoginPath(pathname: string): boolean {
  return /\/restaurant\/(admin|cashier|waiter|kitchen|delivery)\/login\/?$/.test(
    pathname,
  );
}
