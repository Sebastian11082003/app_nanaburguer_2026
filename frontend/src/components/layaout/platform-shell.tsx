"use client";

import { PlatformBreadcrumbs } from "../navigation/platform-breadcrumbs";
import { PlatformSidebar } from "./platform-sidebar";
import { PlatformTopbar } from "./platform-topbar";

/**
 * Top-level shell for every `/platform/*` page (except login). Sidebar is
 * only visible on `lg+`; below that, `PlatformTopbar` renders its own
 * hamburger + drawer with the same nav items.
 */
export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="brand-atmosphere flex min-h-screen text-paper">
      <PlatformSidebar />

      <div className="flex flex-1 flex-col overflow-x-hidden">
        <PlatformTopbar />

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <PlatformBreadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
