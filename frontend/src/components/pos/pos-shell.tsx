"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

import { BrandMark } from "@/src/components/brand/brand-mark";
import { posNavForRole } from "@/src/lib/pos-nav";
import { useAuthStore } from "@/src/store/auth.store";
import { useRestaurantStore } from "@/src/store/restaurant.store";

/**
 * Shared POS chrome: one header + one nav. Role only filters the tabs.
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

  function handleLogout() {
    logoutStaff();
    logoutRestaurant();
    router.push("/restaurant/login");
  }

  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="border-b border-white/10 bg-black/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandMark
              size={36}
              name={restaurant?.name ?? "Restaurante"}
              logoUrl={restaurant?.logoUrl}
            />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-flame">
                {restaurant?.name ?? "Restaurante"}
              </p>
              {restaurant?.slug && (
                <p className="font-mono text-xs text-muted">{restaurant.slug}</p>
              )}
              <p className="text-sm text-muted">{user?.fullName}</p>
            </div>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-full border border-white/15 px-3 py-1.5 text-sm"
            >
              {user?.role ?? "Cuenta"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-white/10 bg-zinc-950 py-1 text-sm">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left hover:bg-white/5"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {nav.map((item) => {
            const active =
              item.href === "/restaurant/app"
                ? pathname === "/restaurant/app"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
