import { restaurantApi } from "@/src/lib/restaurant-api";

import { UpdateRestaurantSettingsDto } from "@/src/types/restaurant";

export const restaurantService = {
  async getMe() {
    const response = await restaurantApi.get("/restaurant/me");

    return response.data;
  },

  async updateSettings(data: UpdateRestaurantSettingsDto) {
    const response = await restaurantApi.patch("/restaurant/settings", data);

    return response.data;
  },
};
