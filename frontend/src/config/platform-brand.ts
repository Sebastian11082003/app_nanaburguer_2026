/**
 * Identity of the SaaS PLATFORM itself — as opposed to any individual
 * tenant restaurant's brand (see `store/restaurant.store.ts`).
 *
 * This is a multi-tenant product meant to be sold to many different
 * restaurants/gastrobares/etc, so the platform's own screens (landing
 * `/`, the platform admin back-office `/platform/*`, and the pre-login
 * `/restaurant/login` gate where the tenant hasn't been resolved yet)
 * must NEVER show a specific customer's branding (e.g. a pilot client
 * like "Nana Burger"). Everything the platform's own UI needs lives here
 * as a single, easy-to-rename source of truth.
 */
export const PLATFORM_BRAND = {
  /** Rename this once the product has its own commercial name. */
  name: "RestoOS",
  tagline: "Sistema operativo para restaurantes",
} as const;
