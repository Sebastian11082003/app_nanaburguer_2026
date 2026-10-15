/**
 * Deterministic accent color for a menu category, derived from its name.
 *
 * Loggro assigns each category a distinct colored badge so waiters can
 * scan the menu grid visually instead of reading every label. We want the
 * same effect WITHOUT hardcoding a palette per tenant (every restaurant
 * has different category names) — hashing the name into a hue does that
 * generically: same name always gets the same color, no config needed.
 */
export function categoryColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}
