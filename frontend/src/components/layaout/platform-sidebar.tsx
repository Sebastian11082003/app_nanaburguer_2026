"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { platformNavigation } from "@/src/config/navigation";

export function PlatformSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800 bg-black p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-black">NanaBurger</h1>

        <p className="text-sm text-zinc-400">SaaS Platform</p>
      </div>

      <nav className="flex flex-col gap-2">
        {platformNavigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
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
