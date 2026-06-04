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
  };
}
