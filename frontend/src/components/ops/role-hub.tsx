"use client";

import Link from "next/link";

import { BrandMark } from "@/src/components/brand/brand-mark";
import { useHydratedRestaurant } from "@/src/hooks/use-hydrated-restaurant";

interface HubLink {
  href: string;
  title: string;
  description: string;
}

interface RoleHubProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  links: HubLink[];
  onLogout?: () => void;
}

export function RoleHub({
  eyebrow,
  title,
  subtitle,
  links,
  onLogout,
}: RoleHubProps) {
  const { restaurant } = useHydratedRestaurant();

  return (
    <main className="brand-atmosphere brand-noise relative min-h-screen overflow-x-hidden px-4 py-6 text-paper sm:px-6 sm:py-12">
      <div className="brand-grid absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="animate-rise min-w-0">
            {restaurant && (
              <div className="mb-4 flex items-center gap-3">
                <BrandMark
                  size={56}
                  name={restaurant.name}
                  logoUrl={restaurant.logoUrl}
                />
                <div className="min-w-0">
                  <p className="truncate font-display text-lg">{restaurant.name}</p>
                  <p className="truncate font-mono text-xs text-flame">
                    {restaurant.slug}
                  </p>
                </div>
              </div>
            )}
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-flame sm:text-xs sm:tracking-[0.28em]">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">
              {subtitle}
            </p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="btn-ghost min-h-11 shrink-0 text-sm"
            >
              Salir
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`panel-surface p-5 transition hover:-translate-y-1 hover:border-flame/40 sm:p-8 ${
                index === 0 ? "animate-rise-delay-1" : "animate-rise-delay-2"
              }`}
            >
              <h2 className="font-display text-xl sm:text-2xl">{link.title}</h2>
              <p className="mt-2 text-sm text-muted sm:text-base">
                {link.description}
              </p>
              <p className="mt-6 text-sm font-semibold text-flame sm:mt-8">
                Abrir →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
