import { api } from "@/src/lib/api";
import { AuthUser, UserRole } from "@/src/types/auth";

interface StaffLoginDto {
  email: string;
  password: string;
}

export interface StaffRestaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface StaffLoginResponse {
  accessToken: string;
  user: AuthUser;
  restaurant: StaffRestaurant;
}

export function homeForRole(role: UserRole): string {
  if (role === "KITCHEN") return "/restaurant/kitchen";
  return "/restaurant/app";
}

export const userAuthService = {
  staffLogin(data: StaffLoginDto): Promise<StaffLoginResponse> {
    return api.post("/auth/staff-login", data).then((res) => res.data);
  },

  forgotPassword(email: string): Promise<{ ok: true; resetUrl?: string }> {
    return api.post("/auth/forgot-password", { email }).then((res) => res.data);
  },

  resetPassword(token: string, password: string): Promise<{ ok: true }> {
    return api
      .post("/auth/reset-password", { token, password })
      .then((res) => res.data);
  },

  adminLogin(data: StaffLoginDto & { slug?: string }) {
    return api.post("/auth/admin-login", data).then((res) => res.data);
  },

  cashierLogin(data: StaffLoginDto & { slug?: string }) {
    return api.post("/auth/cashier-login", data).then((res) => res.data);
  },

  waiterLogin(data: StaffLoginDto & { slug?: string }) {
    return api.post("/auth/waiter-login", data).then((res) => res.data);
  },

  kitchenLogin(data: StaffLoginDto & { slug?: string }) {
    return api.post("/auth/kitchen-login", data).then((res) => res.data);
  },

  deliveryLogin(data: StaffLoginDto & { slug?: string }) {
    return api.post("/auth/delivery-login", data).then((res) => res.data);
  },
};
