import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

/**
 * Fields it's safe to hand back to the tenant's own ADMIN in the browser.
 * Deliberately excludes `restaurantPasswordHash` (the restaurant-level
 * login secret) and `factusApiKey` (a third-party billing credential) —
 * the previous version of this service returned the raw Prisma record,
 * which leaked both into the frontend's network tab/state on every
 * `/restaurants/me` call.
 */
const SAFE_RESTAURANT_SELECT = {
  id: true,
  name: true,
  slug: true,
  nit: true,
  email: true,
  phone: true,
  address: true,
  logoUrl: true,
  primaryColor: true,
  isActive: true,
  createdAt: true,
} as const;

/** Manages a single tenant's own restaurant record — see controller docs for why this is `/me`-only. */
@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  async findOwn(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: SAFE_RESTAURANT_SELECT,
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async updateOwn(restaurantId: string, dto: UpdateRestaurantDto) {
    const existing = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existing) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: dto,
      select: SAFE_RESTAURANT_SELECT,
    });
  }

  /** Persists a newly uploaded logo path. Kept separate from `updateOwn` — see controller docs. */
  async updateLogo(restaurantId: string, logoUrl: string) {
    const existing = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existing) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { logoUrl },
      select: SAFE_RESTAURANT_SELECT,
    });
  }
}
