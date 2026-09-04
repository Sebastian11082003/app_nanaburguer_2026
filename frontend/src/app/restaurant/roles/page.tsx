"use client";

import Link from "next/link";

import { BrandMark } from "@/src/components/brand/brand-mark";
import { STATIONS, stationEmail } from "@/src/lib/stations";
import { useRestaurantStore } from "@/src/store/restaurant.store";

const ROLE_COPY: Record<
  string,
  { name: string; description: string; badge: string }
> = {
  ADMIN: {
    name: "Administrador",
    description: "Menú, usuarios, mesas y visión completa del local",
    badge: "Admin",
  },
  CASHIER: {
    name: "Cajero",
    description: "Cierre de ventas y cobro de órdenes listas",
    badge: "Caja",
  },
  WAITER: {
    name: "Mesero",
    description: "Mesas, toma de órdenes y envío a cocina",
    badge: "Salón",
  },
  KITCHEN: {
    name: "Cocina",
    description: "Cola de preparación y estados del ticket",
    badge: "KDS",
  },
  DELIVERY: {
    name: "Delivery",
    description: "Pedidos a domicilio y pickup",
    badge: "Domi",
  },
};

export default function RestaurantRolesPage() {
  const restaurant = useRestaurantStore((state) => state.restaurant);
  const slug = restaurant?.slug;

  return (
    <main className="brand-atmosphere brand-noise relative min-h-screen overflow-hidden px-6 py-14 text-paper">
      <div className="brand-grid absolute inset-0" />
      <div className="animate-glow pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-flame/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="animate-rise mb-14 text-center">
          <BrandMark
            size={110}
            className="mx-auto"
            name={restaurant?.name ?? "Restaurante"}
            logoUrl={restaurant?.logoUrl}
          />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-flame">
            Portal operativo
          </p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">Elige tu rol</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Cada estación entra con su propio login. No hace falta pasar
            antes por el correo del restaurante: slug + cuenta de estación.
          </p>
          {slug ? (
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
              Cuentas por defecto:{" "}
              {STATIONS.filter((s) => s.role !== "ADMIN")
                .map((s) => stationEmail(s.emailPrefix, slug))
                .join(" · ")}
            </p>
          ) : (
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
              En el login escribe el slug del local. El correo se sugiere
              como rol@slug.test.
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STATIONS.map((station, index) => {
            const copy = ROLE_COPY[station.role];
            return (
              <Link
                key={station.role}
                href={station.loginHref}
                className={`panel-surface group p-7 transition duration-200 hover:-translate-y-1 hover:border-flame/40 ${
                  index === 0 ? "animate-rise" : ""
                } ${index === 1 ? "animate-rise-delay-1" : ""} ${
                  index >= 2 ? "animate-rise-delay-2" : ""
                }`}
              >
                <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                  {copy.badge}
                </span>
                <h2 className="mt-5 font-display text-3xl">{copy.name}</h2>
                <p className="mt-2 text-muted">{copy.description}</p>
                {slug && (
                  <p className="mt-3 text-xs text-muted">
                    {stationEmail(station.emailPrefix, slug)}
                  </p>
                )}
                <p className="mt-8 text-sm font-semibold text-flame transition group-hover:translate-x-1">
                  Ingresar →
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
