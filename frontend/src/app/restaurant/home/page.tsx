"use client";

import Link from "next/link";

import { BrandMark } from "@/src/components/brand/brand-mark";
import { useRestaurantStore } from "@/src/store/restaurant.store";

export default function RestaurantHomePage() {
  const { restaurant } = useRestaurantStore();

  return (
    <main className="brand-atmosphere brand-noise relative min-h-screen overflow-hidden text-paper">
      <div className="brand-grid absolute inset-0" />
      <div className="animate-glow pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-flame/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <section className="animate-rise text-center">
          <BrandMark
            size={120}
            className="mx-auto"
            name={restaurant?.name ?? "Restaurante"}
            logoUrl={restaurant?.logoUrl}
          />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-flame">
            Bienvenido
          </p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">
            {restaurant?.name ?? "Restaurante"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Centro del local. Desde aquí abres el portal de roles para operar
            salón, cocina, caja o delivery.
          </p>
        </section>

        <section className="animate-rise-delay-1 mt-12 grid gap-4 md:grid-cols-3">
          <div className="panel-surface p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Restaurante
            </p>
            <p className="mt-3 font-display text-2xl">
              {restaurant?.name ?? "Sin información"}
            </p>
          </div>
          <div className="panel-surface p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Slug</p>
            <p className="mt-3 font-display text-2xl">
              {restaurant?.slug ?? "—"}
            </p>
          </div>
          <div className="panel-surface p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Estado
            </p>
            <p className="mt-3 font-display text-2xl text-success">Activo</p>
          </div>
        </section>

        <section className="animate-rise-delay-2 mt-10 panel-surface p-10 text-center">
          <p className="font-script text-3xl text-flame">Listos para servir</p>
          <h2 className="mt-2 font-display text-4xl">Portal operativo</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Selecciona el módulo según tu rol.
          </p>
          <Link href="/restaurant/roles" className="btn-primary mt-8">
            Ir al portal de roles →
          </Link>
        </section>
      </div>
    </main>
  );
}
