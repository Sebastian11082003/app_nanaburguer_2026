"use client";

import { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { restaurantAdminNavigation } from "@/src/config/restaurant-navigation";

export default function RestaurantAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* SIDEBAR */}
      <aside
        className="
          hidden
          w-72
          border-r
          border-zinc-800
          bg-zinc-950
          lg:flex
          lg:flex-col
        "
      >
        {/* HEADER */}
        <div className="border-b border-zinc-800 p-6">
          <h2 className="text-2xl font-black">NanaBurger</h2>

          <p className="mt-1 text-sm text-zinc-500">Panel Administrativo</p>
        </div>

        {/* NAV */}
        <nav className="flex-1 space-y-2 p-4">
          {restaurantAdminNavigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  px-4
                  py-3
                  transition-all
                  ${
                    active
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }
                `}
              >
                <span>{item.icon}</span>

                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1">
        {/* TOPBAR */}
        <header
          className="
            flex
            h-20
            items-center
            justify-between
            border-b
            border-zinc-800
            px-6
          "
        >
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>

            <p className="text-sm text-zinc-500">
              Administración del restaurante
            </p>
          </div>

          <button
            className="
              rounded-xl
              border
              border-zinc-700
              px-4
              py-2
              text-sm
              transition-all
              hover:bg-zinc-900
            "
          >
            Cerrar sesión
          </button>
        </header>

        {/* PAGE */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
