import type { CSSProperties } from "react";

const HEX = /^#([0-9a-fA-F]{6})$/;

/** Maps the tenant primary color onto --flame (original chrome). */
export function tenantThemeStyle(
  primaryColor?: string | null,
): CSSProperties | undefined {
  const value = primaryColor?.trim();
  if (!value || !HEX.test(value)) return undefined;
  return {
    ["--flame" as string]: value,
  } as CSSProperties;
}
