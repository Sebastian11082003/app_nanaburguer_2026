export type UserRole = "ADMIN" | "CASHIER" | "WAITER" | "DELIVERY" | "KITCHEN";

export interface AuthUser {
  id: string;

  email: string;

  fullName: string;

  role: UserRole;

  restaurantId: string;
}

export interface LoginResponse {
  accessToken: string;

  user: AuthUser;
}
export interface LoginDto {
  slug: string;

  email: string;

  password: string;
}

export interface LoginResponse {
  accessToken: string;

  user: AuthUser;
}
