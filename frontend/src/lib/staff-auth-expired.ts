export const STAFF_AUTH_EXPIRED_MESSAGE =
  "Sesión vencida. Entrá de nuevo.";

const AUTH_PATH =
  /\/auth\/(staff-login|forgot-password|reset-password)(?:\?|$)/;

/** Login/recover 401 must stay on the form (wrong password), not bounce. */
export function isStaffCredentialRequest(url: string | undefined): boolean {
  const path = (url ?? "").split("?")[0];
  return AUTH_PATH.test(path);
}

export function shouldExpireStaffSession(
  status: number | undefined,
  url?: string,
): boolean {
  return status === 401 && !isStaffCredentialRequest(url);
}
