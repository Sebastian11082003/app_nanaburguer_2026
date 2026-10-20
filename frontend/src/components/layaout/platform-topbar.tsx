"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  MobileNavDrawer,
  MobileNavTrigger,
} from "@/src/components/layaout/mobile-nav-drawer";
import { platformNavigation } from "@/src/config/navigation";
import { usePlatformAuthStore } from "@/src/store/platform-auth.store";
import { PlatformBrand } from "./platform-sidebar";

/**
 * Topbar for the platform shell. On mobile it also owns the hamburger
 * trigger + drawer for `platformNavigation`, since `PlatformSidebar` is
 * hidden below `lg`.
 */
export function PlatformTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const admin = usePlatformAuthStore((state) => state.admin);
  const logout = usePlatformAuthStore((state) => state.logout);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="flex h-20 items-center justify-between border-b border-white/10 px-4 sm:px-8">
        <div className="flex items-center">
          <MobileNavTrigger onClick={() => setMobileNavOpen(true)} />

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-flame">
              Plataforma
            </p>
            <h2 className="font-display text-lg sm:text-xl">Control SaaS</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden text-right sm:block">
            <p className="font-semibold">{admin?.fullName}</p>
            <p className="text-sm text-muted">Super Admin</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 font-display">
            {admin?.fullName?.charAt(0)}
          </div>

          <button
            type="button"
            className="btn-ghost px-3 py-2 text-xs sm:px-4 sm:text-sm"
            onClick={() => {
              logout();
              router.push("/platform/login");
            }}
          >
            Salir
          </button>
        </div>
      </header>

      <MobileNavDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        brand={<PlatformBrand />}
        items={platformNavigation}
        isActive={(href) => href === pathname}
      />
    </>
  );
}
