"use client";

import Link from "next/link";
import { ReactNode, useEffect } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Logo/title block rendered at the top of the drawer, same as the desktop sidebar. */
  brand: ReactNode;
  items: NavItem[];
  /** Given an item, decide if it should be highlighted as the current page. */
  isActive: (href: string) => boolean;
}

/**
 * Slide-in navigation drawer used on small screens (below `lg`), where the
 * permanent sidebar (`hidden lg:flex`) is not rendered.
 *
 * This is a SEPARATE component (not just a CSS breakpoint on the sidebar)
 * because a fixed sidebar squeezed onto a phone-width screen is unusable —
 * it needs its own overlay + trigger button instead of just becoming
 * visible. Reused by both the restaurant admin layout and the platform
 * shell so the two navigations behave identically on mobile.
 */
export function MobileNavDrawer({
  open,
  onClose,
  brand,
  items,
  isActive,
}: MobileNavDrawerProps) {
  // Prevent the page behind the drawer from scrolling while it's open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop: tapping outside the panel closes the drawer. */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 flex h-full w-72 max-w-[80vw] flex-col border-r border-white/10 bg-ink">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          {brand}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-lg p-2 text-2xl leading-none text-muted hover:bg-white/5 hover:text-paper"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                isActive(item.href)
                  ? "bg-paper text-ink"
                  : "text-muted hover:bg-white/5 hover:text-paper"
              }`}
            >
              {item.icon && <span className="opacity-80">{item.icon}</span>}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}

/**
 * Hamburger button that opens a `MobileNavDrawer`. Only rendered below
 * `lg` — on larger screens the permanent sidebar is already visible, so
 * there is nothing to toggle.
 */
export function MobileNavTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir menú"
      className="mr-3 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/10 lg:hidden"
    >
      <span className="h-0.5 w-5 bg-paper" />
      <span className="h-0.5 w-5 bg-paper" />
      <span className="h-0.5 w-5 bg-paper" />
    </button>
  );
}
