"use client";

import Image from "next/image";
import Link from "next/link";

import { useRestaurantStore } from "@/src/store/restaurant.store";

export default function RestaurantHomePage() {
  const { restaurant } = useRestaurantStore();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/logo/nana-logo.jpeg"
              alt="NanaBurger"
              width={140}
              height={140}
              className="rounded-3xl border border-zinc-700 bg-white p-3"
            />

            <h1 className="mt-8 text-5xl font-black">
              Bienvenido a {restaurant?.name ?? "NanaBurger"}
            </h1>

            <p className="mt-4 max-w-2xl text-zinc-400">
              Centro de administración del restaurante. Desde aquí podrás
              acceder a los diferentes módulos operativos del sistema.
            </p>
          </div>
        </div>
      </section>

      {/* INFO */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-sm text-zinc-500">Restaurante</h3>

            <p className="mt-3 text-2xl font-bold">
              {restaurant?.name ?? "Sin información"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-sm text-zinc-500">Slug</h3>

            <p className="mt-3 text-2xl font-bold">{restaurant?.slug ?? "-"}</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-sm text-zinc-500">Estado</h3>

            <p className="mt-3 text-2xl font-bold text-green-500">Activo</p>
          </div>
        </div>
      </section>

      {/* RESUMEN */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <h2 className="mb-6 text-3xl font-black">Resumen General</h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-500">Usuarios</p>

            <h3 className="mt-2 text-4xl font-black">0</h3>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-500">Productos</p>

            <h3 className="mt-2 text-4xl font-black">0</h3>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-500">Categorías</p>

            <h3 className="mt-2 text-4xl font-black">0</h3>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-500">Mesas</p>

            <h3 className="mt-2 text-4xl font-black">0</h3>
          </div>
        </div>
      </section>

      {/* ACCIONES */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <h2 className="text-4xl font-black">Portal Operativo</h2>

          <p className="mt-4 text-zinc-400">
            Selecciona el módulo operativo al que deseas ingresar.
          </p>

          <Link
            href="/restaurant/roles"
            className="
              mt-8
              inline-flex
              rounded-2xl
              bg-white
              px-8
              py-4
              font-bold
              text-black
            "
          >
            Ir al Portal de Roles →
          </Link>
        </div>
      </section>
    </main>
  );
}
