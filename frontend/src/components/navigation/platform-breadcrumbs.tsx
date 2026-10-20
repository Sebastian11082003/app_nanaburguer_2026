"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

export function PlatformBreadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");

        const isLast = index === segments.length - 1;

        return (
          <div key={href} className="flex items-center gap-2">
            {!isLast ? (
              <Link href={href} className="hover:text-white">
                {segment}
              </Link>
            ) : (
              <span className="text-white">{segment}</span>
            )}

            {!isLast && <span>/</span>}
          </div>
        );
      })}
    </div>
  );
}
