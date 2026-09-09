"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

import { BrandMark } from "@/src/components/brand/brand-mark";
import { releaseEmptyTicketIfNeeded } from "@/src/lib/empty-ticket-leave";
import { isPosNavActive, posNavForRole } from "@/src/lib/pos-nav";
import { useAuthStore } from "@/src/store/auth.store";
import { useRestaurantStore } from "@/src/store/restaurant.store";

/**
 * Shared POS chrome: one header + one nav. Role only filters the tabs.
 * Sticky + horizontal-scroll tabs so a phone can run the floor.
 */
export function PosShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logoutStaff = useAuthStore((s) => s.logout);
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const logoutRestaurant = useRestaurantStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = posNavForRole(user?.role);

  async function leaveTo(href: string) {
    // Empty CREATED tickets must die here — a plain Link would leave the floor red.
    await releaseEmptyTicketIfNeeded();
    router.push(href);
  }

  async function handleLogout() {
    await releaseEmptyTicketIfNeeded();
    logoutStaff();
    router.push("/restaurant/login");
  }

  async function handleChangeLocal() {
    await releaseEmptyTicketIfNeeded();
    logoutStaff();
    logoutRestaurant();
    router.push("/restaurant/login");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink text-paper">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <BrandMark
              size={32}
              className="shrink-0 sm:!w-auto"
              name={restaurant?.name ?? "Restaurante"}
              logoUrl={restaurant?.logoUrl}
            />
            <div className="min-w-0">
              <p className="truncate text-[11px] uppercase tracking-[0.16em] text-flame sm:text-xs sm:tracking-[0.2em]">
                {restaurant?.name ?? "Restaurante"}
              </p>
              {restaurant?.slug && (
                <p className="truncate font-mono text-[11px] text-muted sm:text-xs">
                  {restaurant.slug}
                </p>
              )}
              <p className="hidden truncate text-sm text-muted sm:block">
                {user?.fullName}
              </p>
            </div>
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="min-h-11 rounded-full border border-white/15 px-3 py-1.5 text-xs sm:text-sm"
            >
              {user?.role ?? "Cuenta"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-white/10 bg-zinc-950 py-1 text-sm">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block min-h-11 w-full px-4 py-2 text-left hover:bg-white/5"
                >
                  Cerrar sesión
                </button>
                <button
                  type="button"
                  onClick={handleChangeLocal}
                  className="block min-h-11 w-full px-4 py-2 text-left hover:bg-white/5"
                >
                  Cambiar local
                </button>
              </div>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map((item) => {
            const active = isPosNavActive(item, pathname);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  void leaveTo(item.href);
                }}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-3 py-1.5 text-sm ${
                  active
                    ? "bg-paper text-ink"
                    : "text-muted hover:bg-white/5 hover:text-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">{children}</div>
    </div>
  );
}
