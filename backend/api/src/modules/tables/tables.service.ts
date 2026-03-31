import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTableDto) {
    return this.prisma.tableEntity.create({
      data: {
        label: dto.label,
        capacity: dto.capacity,
        isActive: true,
      },
    });
  }

  async findAll() {
    return this.prisma.tableEntity.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.tableEntity.findUnique({
      where: { id },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async update(id: string, dto: UpdateTableDto) {
    const existing = await this.prisma.tableEntity.findUnique({
      where: { id },
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
