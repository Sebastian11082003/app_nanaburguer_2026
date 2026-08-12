export interface RestaurantLoginDto {
  slug: string;
  email: string;
  password: string;
}

export interface RestaurantLoginResponse {
  accessToken: string;

  restaurant: {
    id: string;
    name: string;
    slug: string;
    /** Per-tenant logo, set by the restaurant itself. `null` until they upload one. */
    logoUrl: string | null;
  };
}
