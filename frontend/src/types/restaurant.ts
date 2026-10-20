export interface Restaurant {
  id: string;

  name: string;

  slug: string;

  nit: string;

  email?: string;

  phone?: string;

  address?: string;

  logoUrl?: string;

  primaryColor?: string;
}

export interface UpdateRestaurantSettingsDto {
  name?: string;

  email?: string;

  phone?: string;

  address?: string;

  logoUrl?: string;

  primaryColor?: string;
}
