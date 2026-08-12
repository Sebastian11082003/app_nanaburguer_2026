const DAY = 60 * 60 * 24;

export const STAFF_TOKEN_COOKIE = "nb_staff_token";
export const PLATFORM_TOKEN_COOKIE = "nb_platform_token";

export function setAuthCookie(name: string, value: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax; Max-Age=${DAY}`;
}

export function clearAuthCookie(name: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; path=/; SameSite=Lax; Max-Age=0`;
}
