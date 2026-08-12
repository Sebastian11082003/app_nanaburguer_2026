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
    <main className="brand-atmosphere brand-noise relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="brand-grid pointer-events-none absolute inset-0" />
      <div className="animate-glow pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-flame/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-rise">
        <div className="mb-8 flex justify-center">
          {brand ?? <PlatformMark size={88} />}
        </div>

        <div className="panel-surface p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-flame">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl text-paper">{title}</h1>
          <p className="mt-2 text-muted">{description}</p>

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
