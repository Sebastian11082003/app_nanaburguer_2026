export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;

  priceCents: number;

  isAvailable: boolean;

  categoryId: string;
}
