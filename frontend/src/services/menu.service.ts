import { api } from "@/src/lib/api";
import { Category, MenuItem } from "@/src/types/menu";

export interface CreateMenuItemPayload {
  categoryId: string;
  name: string;
  description?: string;
  priceCents: number;
}

export const menuService = {
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get("/menu/categories");
    return data;
  },

  async createCategory(payload: { name: string }): Promise<Category> {
    const { data } = await api.post("/menu/categories", payload);
    return data;
  },

  async getItems(): Promise<MenuItem[]> {
    const { data } = await api.get("/menu/items");
    return data;
  },

  async createItem(payload: CreateMenuItemPayload): Promise<MenuItem> {
    const { data } = await api.post("/menu/items", payload);
    return data;
  },
};
