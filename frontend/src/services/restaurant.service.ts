import { restaurantApi } from "@/src/lib/restaurant-api";

import { Restaurant, UpdateRestaurantSettingsDto } from "@/src/types/restaurant";

/**
 * Self-service settings for the caller's OWN tenant (ADMIN only).
 * Matches the backend's `/restaurants/me` routes — there is no
 * `:id`-based variant on purpose (see `RestaurantController` docs).
 */
export const restaurantService = {
  async getMe(): Promise<Restaurant> {
    const response = await restaurantApi.get("/restaurants/me");
    return response.data;
  },

  async updateSettings(
    data: UpdateRestaurantSettingsDto,
  ): Promise<Restaurant> {
    const response = await restaurantApi.patch("/restaurants/me", data);
    return response.data;
  },

  /**
   * Uploads a new logo image file and returns the updated restaurant
   * (with its fresh `logoUrl`). See `RestaurantController#uploadLogo`.
   */
  async uploadLogo(file: File): Promise<Restaurant> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await restaurantApi.post("/restaurants/me/logo", formData);
    return response.data;
  },
};
