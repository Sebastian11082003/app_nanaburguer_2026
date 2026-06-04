"use client";

import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/src/components/shared/theme-toggle";

const roles = [
  {
    name: "Administrador",
    description: "Gestión completa del restaurante",
    icon: "👑",
    href: "/restaurant/admin/login",
    color: "from-yellow-500/20 to-yellow-700/10 border-yellow-500/20",
  },

  {
    name: "Cajero",
    description: "Ventas y facturación",
    icon: "💳",
    href: "/restaurant/cashier/login",
    color: "from-emerald-500/20 to-emerald-700/10 border-emerald-500/20",
  },

  {
    name: "Mesero",
    description: "Órdenes y mesas",
    icon: "🍽️",
    href: "/restaurant/waiter/login",
    color: "from-blue-500/20 to-blue-700/10 border-blue-500/20",
  },

  {
    name: "Cocina",
    description: "Preparación de pedidos",
    icon: "👨‍🍳",
    href: "/restaurant/kitchen/login",
    color: "from-red-500/20 to-red-700/10 border-red-500/20",
  },

  {
    name: "Delivery",
    description: "Gestión de domicilios",
    icon: "🛵",
    href: "/restaurant/delivery/login",
    color: "from-purple-500/20 to-purple-700/10 border-purple-500/20",
  },
];

export default function RestaurantRolesPage() {
  return (
    <>
      <ThemeToggle />

      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-12 text-center">
            <Image
              src="/logo/nana-logo.jpeg"
              alt="NanaBurger"
              width={120}
              height={120}
              className="mx-auto rounded-3xl border border-zinc-700 bg-white p-2"
            />

            <h1 className="mt-6 text-5xl font-black">Portal de Roles</h1>

            <p className="mt-4 text-zinc-400">
              Selecciona el módulo operativo al que deseas ingresar
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <Link
                key={role.name}
                href={role.href}
                className={`
                  group
                  rounded-[32px]
                  border
                  bg-gradient-to-br
                  ${role.color}
                  p-8
                  transition-all
                  hover:-translate-y-1
                `}
              >
                <div className="mb-6 text-5xl">{role.icon}</div>

                <h2 className="text-3xl font-black">{role.name}</h2>

                <p className="mt-2 text-zinc-300">{role.description}</p>

                <div className="mt-8">Ingresar →</div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
