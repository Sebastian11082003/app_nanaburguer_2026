import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMenuItemDto, restaurantId: string) {
    // validar categoría del mismo tenant
    const category = await this.prisma.category.findFirst({
      where: {
        id: dto.categoryId,
        restaurantId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.menuItem.create({
      data: {
        name: dto.name,
        description: dto.description,
        priceCents: dto.priceCents,
        isAvailable: true,
        categoryId: dto.categoryId,
        restaurantId,
      },
    });
  }

  async findAll(restaurantId: string) {
    return this.prisma.menuItem.findMany({
      where: { restaurantId },
      include: {
        category: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async update(id: string, dto: UpdateMenuItemDto, restaurantId: string) {
    const existing = await this.prisma.menuItem.findFirst({
      where: { id, restaurantId },
    });

    if (!existing) {
      throw new NotFoundException('Menu item not found');
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.priceCents !== undefined ? { priceCents: dto.priceCents } : {}),
        ...(dto.isAvailable !== undefined
          ? { isAvailable: dto.isAvailable }
          : {}),
      },
    });
  }
}
