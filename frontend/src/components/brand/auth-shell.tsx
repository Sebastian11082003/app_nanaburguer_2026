import Link from "next/link";
import { ReactNode } from "react";

import { PlatformMark } from "@/src/components/brand/platform-mark";

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footerHref?: string;
  footerLabel?: string;
  /**
   * What to render above the title. Defaults to the generic platform mark
   * — pass a tenant `<BrandMark name=.. logoUrl=.. />` explicitly on
   * screens that are already inside a resolved restaurant's context
   * (e.g. its role login pages), never the other way around.
   */
  brand?: ReactNode;
}

export function AuthShell({
  eyebrow = "Acceso",
  title,
  description,
  children,
  footerHref = "/",
  footerLabel = "Volver al inicio",
  brand,
}: AuthShellProps) {
  return (
    <main className="brand-atmosphere brand-noise relative flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-6 sm:py-10">
      <div className="brand-grid pointer-events-none absolute inset-0" />
      <div className="animate-glow pointer-events-none absolute left-1/2 top-0 h-64 w-[min(36rem,100%)] -translate-x-1/2 rounded-full bg-flame/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-rise">
        <div className="mb-6 flex justify-center sm:mb-8">
          {brand ?? <PlatformMark size={88} />}
        </div>

        <div className="panel-surface p-5 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-flame sm:text-xs sm:tracking-[0.24em]">
            {eyebrow}
          </p>
          <h1 className="mt-3 break-words font-display text-2xl text-paper sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">{description}</p>

          <div className="mt-8">{children}</div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href={footerHref}
            className="text-sm text-muted transition hover:text-paper"
          >
            {footerLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
