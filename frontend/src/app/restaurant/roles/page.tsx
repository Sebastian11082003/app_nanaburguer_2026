"use client";

import Link from "next/link";

import { BrandMark } from "@/src/components/brand/brand-mark";
import { useRestaurantStore } from "@/src/store/restaurant.store";

const roles = [
  {
    name: "Administrador",
    description: "Menú, usuarios, mesas y visión completa del local",
    href: "/restaurant/admin/login",
    label: "Admin",
  },
  {
    name: "Cajero",
    description: "Cierre de ventas y cobro de órdenes listas",
    href: "/restaurant/cashier/login",
    label: "Caja",
  },
  {
    name: "Mesero",
    description: "Mesas, toma de órdenes y envío a cocina",
    href: "/restaurant/waiter/login",
    label: "Salón",
  },
  {
    name: "Cocina",
    description: "Cola de preparación y estados del ticket",
    href: "/restaurant/kitchen/login",
    label: "KDS",
  },
  {
    name: "Delivery",
    description: "Pedidos a domicilio y pickup",
    href: "/restaurant/delivery/login",
    label: "Domi",
  },
];

export default function RestaurantRolesPage() {
  const restaurant = useRestaurantStore((state) => state.restaurant);

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
            Cada estación del restaurante entra por su propio acceso. Misma
            marca, distinto flujo.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role, index) => (
            <Link
              key={role.name}
              href={role.href}
              className={`panel-surface group p-7 transition duration-200 hover:-translate-y-1 hover:border-flame/40 ${
                index === 0 ? "animate-rise" : ""
              } ${index === 1 ? "animate-rise-delay-1" : ""} ${
                index >= 2 ? "animate-rise-delay-2" : ""
              }`}
            >
              <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                {role.label}
              </span>
              <h2 className="mt-5 font-display text-3xl">{role.name}</h2>
              <p className="mt-2 text-muted">{role.description}</p>
              <p className="mt-8 text-sm font-semibold text-flame transition group-hover:translate-x-1">
                Ingresar →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
