export type UserRole = "ADMIN" | "CASHIER" | "WAITER" | "DELIVERY" | "KITCHEN";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  restaurantId?: string;
  roleId?: string | null;
  permissions?: string[];
};

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginDto {
  slug: string;
  email: string;
  password: string;
}

/** True if the user has the permission. Empty permissions on ADMIN = legacy allow. */
export function hasPermission(
  user: AuthUser | null | undefined,
  code: string,
): boolean {
  if (!user) return false;
  if (!user.permissions || user.permissions.length === 0) {
    return user.role === "ADMIN";
  }
  return user.permissions.includes(code);
}
