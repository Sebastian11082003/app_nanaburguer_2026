import { api } from "@/src/lib/api";
import { RestaurantLoginDto } from "../types/restaurant-auth";

interface RestaurantLoginResponse {
  accessToken: string;

  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
}

export const restaurantAuthService = {
  async login(data: RestaurantLoginDto): Promise<RestaurantLoginResponse> {
    const response = await api.post("/restaurant-auth/login", data);

    return response.data;
  },
};
