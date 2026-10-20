import Link from "next/link";

import { PLATFORM_BRAND } from "@/src/config/platform-brand";

/**
 * Public landing page for the SaaS PLATFORM itself — not any tenant.
 * This is what a prospective restaurant/gastrobar sees before signing up,
 * so it must only ever show `PLATFORM_BRAND`, never a specific customer's
 * name/logo (a specific tenant's branding only appears after
 * `/restaurant/login` resolves which restaurant is logging in).
 */
export default function LandingPage() {
  return (
    <main className="brand-atmosphere brand-noise relative min-h-screen overflow-hidden text-paper">
      <div className="brand-grid absolute inset-0" />
      <div className="animate-glow pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-flame/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="animate-rise flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-paper text-ink">
              <span className="font-display text-xl" aria-hidden="true">
                {PLATFORM_BRAND.name.charAt(0)}
              </span>
            </div>
            <p className="font-display text-lg tracking-[0.2em]">
              {PLATFORM_BRAND.name}
            </p>
          </div>

          <Link href="/platform/login" className="text-sm text-muted hover:text-paper">
            Panel SaaS
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16">
          <div className="max-w-3xl">
            <p className="animate-rise text-xs font-semibold uppercase tracking-[0.28em] text-flame">
              {PLATFORM_BRAND.tagline}
            </p>

            <h1 className="animate-rise-delay-1 mt-5 font-display text-6xl leading-[0.95] sm:text-7xl md:text-8xl">
              {PLATFORM_BRAND.name}
            </h1>

            <p className="animate-rise-delay-2 mt-6 max-w-xl text-lg text-muted sm:text-xl">
              Pedidos, cocina, caja y delivery en un solo flujo. Una sola
              plataforma para operar tu restaurante, gastrobar o cadena — y
              lista para crecer hacia pedidos online.
            </p>

            <div className="animate-rise-delay-2 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/restaurant/login" className="btn-primary">
                Entrar a mi restaurante
              </Link>
              <Link href="/platform/login" className="btn-ghost">
                Administrar plataforma
              </Link>
            </div>

            <p className="animate-rise-delay-2 mt-8 text-sm text-muted/80">
              Pronto: landing pública para que el cliente tome su pedido online.
            </p>
          </div>
        </section>

        <footer className="animate-rise border-t border-white/10 py-6 text-sm text-muted">
          Operación · Cocina · Caja · Delivery
        </footer>
      </div>
    </main>
  );
}
