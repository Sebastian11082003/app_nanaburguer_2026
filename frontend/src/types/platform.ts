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
}
export interface CreateRestaurantDto {
  name: string;

  slug: string;

  nit: string;

  email: string;

  phone: string;

  address: string;

  adminName: string;

  adminEmail: string;

  adminPassword: string;
}
