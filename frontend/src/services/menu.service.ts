import { api } from "@/src/lib/api";

export const menuService = {
  async getCategories() {
    const { data } = await api.get("/menu/categories");

    return data;
  },

  async createCategory(payload: { name: string }) {
    const { data } = await api.post("/menu/categories", payload);

    return data;
  },
};
