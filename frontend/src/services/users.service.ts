import { api } from "@/src/lib/api";
import { UserRole } from "@/src/types/auth";

export interface RestaurantUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  roleId?: string | null;
  isActive: boolean;
  createdAt: string;
  assignedRole?: {
    id: string;
    name: string;
    stationKey: UserRole;
    isSystem: boolean;
  } | null;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  roleId?: string;
  role?: UserRole;
}

export const usersService = {
  async getAll(role?: UserRole): Promise<RestaurantUser[]> {
    const { data } = await api.get("/users", {
      params: role ? { role } : undefined,
    });
    return data;
  },

  async create(payload: CreateUserPayload): Promise<RestaurantUser> {
    const { data } = await api.post("/users", payload);
    return data;
  }

  async provisionStationStaff(password: string): Promise<{
    created: RestaurantUser[];
    skipped: UserRole[];
  }> {
    const { data } = await api.post("/users/station-staff", { password });
    return data;
  },

  async getById(id: string): Promise<RestaurantUser> {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async update(
    id: string,
    payload: {
      fullName?: string;
      isActive?: boolean;
      roleId?: string;
      password?: string;
    },
  ): Promise<RestaurantUser> {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data;
  },
};
