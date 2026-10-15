/**
 * Resolves a possibly-relative asset path (e.g. a restaurant's `logoUrl`)
 * into a URL the browser can actually load.
 *
 * Two kinds of "relative" paths exist in this codebase and must be told
 * apart:
 *  - `/uploads/...` — a file uploaded through the API and served BY THE
 *    API (see `RestaurantController#uploadLogo` + `main.ts`), so it must
 *    be resolved against the API origin, not this Next.js app's origin.
 *  - anything else relative (e.g. `/logo/nana-logo.jpeg`) — a static
 *    asset bundled in this app's own `public/` folder, left untouched.
 */
export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/uploads/")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    return `${apiUrl}${path}`;
  }
  return path;
}
