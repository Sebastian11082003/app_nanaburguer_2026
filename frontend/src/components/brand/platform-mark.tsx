import { PLATFORM_BRAND } from "@/src/config/platform-brand";

interface PlatformMarkProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Generic mark for the SaaS platform's own screens (landing, platform
 * back-office, pre-login tenant gate). Deliberately NOT tied to any
 * tenant's logo/image — just a simple monogram built from
 * `PLATFORM_BRAND.name`, so it never accidentally shows a customer's
 * branding on software that's sold to many different restaurants.
 */
export function PlatformMark({
  size = 96,
  showWordmark = false,
  className = "",
}: PlatformMarkProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className="flex items-center justify-center rounded-[28%] border border-white/15 bg-paper text-ink shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        style={{ width: size, height: size }}
      >
        <span
          className="font-display"
          style={{ fontSize: size * 0.42 }}
          aria-hidden="true"
        >
          {PLATFORM_BRAND.name.charAt(0)}
        </span>
      </div>

      {showWordmark && (
        <div className="text-center">
          <p className="font-display text-2xl tracking-[0.18em] text-paper">
            {PLATFORM_BRAND.name}
          </p>
        </div>
      )}
    </div>
  );
}
