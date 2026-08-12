import Image from "next/image";

import { resolveAssetUrl } from "@/src/lib/resolve-asset-url";

interface BrandMarkProps {
  /** Tenant/restaurant name. Used for the fallback monogram and the wordmark. */
  name: string;
  /** Tenant's own logo, if they've set one. Falls back to a monogram when absent. */
  logoUrl?: string | null;
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Per-TENANT brand mark — shows a specific restaurant's own logo/name.
 *
 * Only render this on screens already inside a resolved tenant context
 * (i.e. after `/restaurant/login`, reading from `useRestaurantStore`).
 * Never hardcode a specific customer here: this component takes
 * `name`/`logoUrl` as props precisely so it stays reusable across every
 * restaurant this SaaS is sold to. For the platform's own screens
 * (landing, `/platform/*`), use `PlatformMark` instead.
 */
export function BrandMark({
  name,
  logoUrl,
  size = 96,
  showWordmark = false,
  className = "",
}: BrandMarkProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const resolvedLogoUrl = resolveAssetUrl(logoUrl);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className="flex items-center justify-center overflow-hidden rounded-[28%] border border-white/15 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        style={{ width: size, height: size }}
      >
        {resolvedLogoUrl ? (
          <Image
            src={resolvedLogoUrl}
            alt={name}
            width={size}
            height={size}
            className="h-full w-full object-cover"
            priority
          />
        ) : (
          <span
            className="font-display text-ink"
            style={{ fontSize: size * 0.42 }}
            aria-hidden="true"
          >
            {initial}
          </span>
        )}
      </div>

      {showWordmark && (
        <p className="font-display text-2xl tracking-[0.12em] text-paper">
          {name}
        </p>
      )}
    </div>
  );
}
