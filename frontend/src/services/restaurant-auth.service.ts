import { api } from "@/src/lib/api";
import { RestaurantLoginDto } from "../types/restaurant-auth";

interface RestaurantLoginResponse {
  accessToken: string;

  restaurant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

/** Public branding preview for a slug — see backend `getBranding` docs for why this is intentionally narrow. */
export interface RestaurantBranding {
  name: string;
  slug: string;
  logoUrl: string | null;
}

export const restaurantAuthService = {
  async login(data: RestaurantLoginDto): Promise<RestaurantLoginResponse> {
    const response = await api.post("/restaurant-auth/login", data);

    return response.data;
  },

  /** Returns `null` when the slug doesn't match any active restaurant (never throws for that case). */
  async getBranding(slug: string): Promise<RestaurantBranding | null> {
    if (!slug.trim()) return null;
    const response = await api.get("/restaurant-auth/branding", {
      params: { slug: slug.trim().toLowerCase() },
    });
    const data = response.data as RestaurantBranding | null;
    if (!data?.name) return null;
    return {
      name: data.name,
      slug: data.slug ?? slug.trim().toLowerCase(),
      logoUrl: data.logoUrl ?? null,
    };
  },
};
