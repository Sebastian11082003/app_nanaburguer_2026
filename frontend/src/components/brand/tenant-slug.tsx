/**
 * Visible tenant id. After restaurant-login, every restaurant surface
 * must show this — name alone is not enough in a multi-tenant ERP.
 */
export function TenantSlug({ slug }: { slug: string }) {
  return (
    <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm">
      <span className="text-muted">Slug del restaurante </span>
      <span className="font-mono font-semibold text-flame">{slug}</span>
    </p>
  );
}
