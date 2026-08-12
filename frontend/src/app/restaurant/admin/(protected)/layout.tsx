"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

import { BrandMark } from "@/src/components/brand/brand-mark";
import {
  MobileNavDrawer,
  MobileNavTrigger,
} from "@/src/components/layaout/mobile-nav-drawer";
import { restaurantAdminNavigation } from "@/src/config/restaurant-navigation";
import { useAuthStore } from "@/src/store/auth.store";
import { useRestaurantStore } from "@/src/store/restaurant.store";

/**
 * Logo + name block for the admin sidebar/drawer. This is inside a
 * resolved tenant's context (admin login happens after
 * `/restaurant/login`), so it shows THAT restaurant's own brand — never a
 * hardcoded one — reading from `useRestaurantStore`.
 */
function AdminBrand() {
  const restaurant = useRestaurantStore((state) => state.restaurant);

  return (
    <div className="flex items-center gap-3">
      <BrandMark
        size={44}
        name={restaurant?.name ?? "Restaurante"}
        logoUrl={restaurant?.logoUrl}
      />
      <div>
        <p className="font-display text-lg tracking-[0.14em]">
          {restaurant?.name ?? "Restaurante"}
        </p>
        <p className="-mt-1 text-base text-flame">Admin</p>
      </div>
    </div>
  );
}

/**
 * Shell for every `/restaurant/admin/*` page: permanent sidebar on `lg+`,
 * hamburger-triggered drawer below that (see `MobileNavDrawer`). Both
 * navigations render the same `restaurantAdminNavigation` list so they
 * can never drift out of sync with each other.
 */
export default function RestaurantAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/restaurant/admin/login");
  }

  /** A nav item is "active" on its own route or any of its sub-routes (except the dashboard root). */
  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== "/restaurant/admin" && pathname.startsWith(href))
    );
  }

  return (
    <div className="brand-atmosphere flex min-h-screen text-paper">
      {/* Desktop sidebar — hidden below `lg`, replaced by the drawer there. */}
      <aside className="hidden w-72 flex-col border-r border-white/10 bg-black/40 backdrop-blur-md lg:flex">
        <div className="border-b border-white/10 p-6">
          <AdminBrand />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {restaurantAdminNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                isActive(item.href)
                  ? "bg-paper text-ink"
                  : "text-muted hover:bg-white/5 hover:text-paper"
              }`}
            >
              <span className="opacity-80">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <MobileNavDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        brand={<AdminBrand />}
        items={restaurantAdminNavigation}
        isActive={isActive}
      />

      <main className="flex flex-1 flex-col overflow-x-hidden">
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center">
            <MobileNavTrigger onClick={() => setMobileNavOpen(true)} />

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-flame">
                Panel administrativo
              </p>
              <h1 className="font-display text-lg sm:text-xl">
                {user?.fullName ?? "Administración"}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn-ghost px-3 py-2 text-xs sm:px-4 sm:text-sm"
          >
            Salir
          </button>
        </header>

        <div className="flex-1 p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
