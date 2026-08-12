import Link from "next/link";

interface HubLink {
  href: string;
  title: string;
  description: string;
}

interface RoleHubProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  links: HubLink[];
  onLogout?: () => void;
}

export function RoleHub({
  eyebrow,
  title,
  subtitle,
  links,
  onLogout,
}: RoleHubProps) {
  return (
    <main className="brand-atmosphere brand-noise relative min-h-screen overflow-x-hidden px-4 py-10 text-paper sm:px-6 sm:py-12">
      <div className="brand-grid absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="animate-rise">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-flame">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-xl text-muted">{subtitle}</p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="btn-ghost shrink-0 text-sm"
            >
              Salir
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`panel-surface p-8 transition hover:-translate-y-1 hover:border-flame/40 ${
                index === 0 ? "animate-rise-delay-1" : "animate-rise-delay-2"
              }`}
            >
              <h2 className="font-display text-2xl">{link.title}</h2>
              <p className="mt-2 text-muted">{link.description}</p>
              <p className="mt-8 text-sm font-semibold text-flame">Abrir →</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
