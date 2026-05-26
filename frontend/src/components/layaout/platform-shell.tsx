"use client";

import { PlatformSidebar } from "./platform-sidebar";

import { PlatformTopbar } from "./platform-topbar";

import { PlatformBreadcrumbs } from "../navigation/platform-breadcrumbs";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <PlatformSidebar />

      <div className="flex flex-1 flex-col">
        <PlatformTopbar />

        <main className="flex-1 p-8">
          <PlatformBreadcrumbs />

          {children}
        </main>
      </div>
    </div>
  );
}
