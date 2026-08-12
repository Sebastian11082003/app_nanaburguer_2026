"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { platformNavigation } from "@/src/config/navigation";
import { PLATFORM_BRAND } from "@/src/config/platform-brand";

/**
 * Small logo + wordmark block for the platform back-office, reused by
 * both the desktop sidebar and the mobile drawer. Always the generic
 * `PLATFORM_BRAND` — this screen is not scoped to any tenant.
 */
export function PlatformBrand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white text-ink">
        <span className="font-display text-lg" aria-hidden="true">
          {PLATFORM_BRAND.name.charAt(0)}
        </span>
      </div>
      <div>
        <p className="font-display text-lg tracking-[0.14em]">
          {PLATFORM_BRAND.name}
        </p>
        <p className="-mt-1 text-sm text-flame">SaaS</p>
      </div>
    </div>
  );
}

/**
 * Permanent sidebar for the platform shell. Only rendered on `lg+` — on
 * smaller screens `MobileNavDrawer` (triggered from `PlatformTopbar`)
 * takes over, since a fixed 256px sidebar would swallow most of a phone
 * screen otherwise.
 */
export function PlatformSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-black/40 p-6 backdrop-blur-md lg:flex">
      <div className="mb-10">
        <PlatformBrand />
      </div>

      <nav className="flex flex-col gap-1">
        {platformNavigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-4 py-3 text-sm transition ${
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
    </aside>
  );
}
