export interface PlatformRestaurantUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export interface StationLoginHint {
  role: string;
  email: string;
}

export interface PlatformRestaurant {
  id: string;

  name: string;

  slug: string;

  nit: string;

  email?: string;

  phone?: string;

  address?: string;

  isActive: boolean;

  createdAt: string;

  users?: PlatformRestaurantUser[];

  stationLogins?: StationLoginHint[];

  stationStaffCreated?: number;
}
export interface CreateRestaurantDto {
  name: string;

  slug: string;

  nit: string;

  email: string;

  phone: string;

  address: string;

  restaurantEmail: string;
  restaurantPassword: string;

  adminName: string;

  adminEmail: string;

  adminPassword: string;
}
