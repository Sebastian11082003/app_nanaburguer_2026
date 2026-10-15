import { api } from "@/src/lib/api";
import { UserRole } from "@/src/types/auth";

export type Permission = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  groupName: string;
};

export type RolePermissionLink = {
  permission: Permission;
};

export type RestaurantRole = {
  id: string;
  name: string;
  description: string | null;
  systemKey: UserRole | null;
  isSystem: boolean;
  stationKey: UserRole;
  isActive: boolean;
  permissions: RolePermissionLink[];
  _count?: { users: number };
};

export type CreateRolePayload = {
  name: string;
  description?: string;
  stationKey: UserRole;
  permissionCodes?: string[];
};

export type UpdateRolePayload = {
  name?: string;
  description?: string;
  stationKey?: UserRole;
  permissionCodes?: string[];
  isActive?: boolean;
};

export const rolesService = {
  async listPermissions(): Promise<Permission[]> {
    const { data } = await api.get("/roles/permissions");
    return data;
  },

  async getAll(): Promise<RestaurantRole[]> {
    const { data } = await api.get("/roles");
    return data;
  },

  async create(payload: CreateRolePayload): Promise<RestaurantRole> {
    const { data } = await api.post("/roles", payload);
    return data;
  },

  async update(
    id: string,
    payload: UpdateRolePayload,
  ): Promise<RestaurantRole> {
    const { data } = await api.patch(`/roles/${id}`, payload);
    return data;
  },
};
