import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTableDto, restaurantId: string) {
    return this.prisma.tableEntity.create({
      data: {
        label: dto.label,
        capacity: dto.capacity,
        isActive: true,
        restaurantId,
      },
    });
  }

  async findAll(restaurantId: string) {
    return this.prisma.tableEntity.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: string, restaurantId: string) {
    const table = await this.prisma.tableEntity.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async update(id: string, dto: UpdateTableDto, restaurantId: string) {
    const existing = await this.prisma.tableEntity.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Table not found');
    }

    return this.prisma.tableEntity.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }
}
