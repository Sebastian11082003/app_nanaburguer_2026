import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.restaurant.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async update(id: string, dto: UpdateRestaurantDto) {
    const existing = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.prisma.restaurant.update({
      where: { id },
      data: dto,
    });
  }
  async remove(id: string) {
    const existing = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.prisma.restaurant.delete({
      where: { id },
    });
  }
}
