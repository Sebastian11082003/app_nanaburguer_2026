import { platformApi } from "@/src/lib/platform-api";

import { PlatformRestaurant, CreateRestaurantDto } from "@/src/types/platform";

export const platformService = {
  async getRestaurants(): Promise<PlatformRestaurant[]> {
    const response = await platformApi.get("/platform/restaurants");

    return response.data;
  },

  async createRestaurant(
    data: CreateRestaurantDto,
  ): Promise<PlatformRestaurant> {
    const response = await platformApi.post("/platform/restaurants", data);

    return response.data;
  },
};
