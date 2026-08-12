import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
  ) {}

  async create(dto: CreateUserDto, restaurantId: string) {
    await this.rolesService.ensureDefaults(restaurantId);

    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email, restaurantId },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    let roleId = dto.roleId;
    let station: UserRole | undefined = dto.role;

    if (roleId) {
      const assigned = await this.prisma.role.findFirst({
        where: { id: roleId, restaurantId, isActive: true },
      });
      if (!assigned) {
        throw new BadRequestException('Role not found');
      }
      station = assigned.stationKey;
    } else if (station) {
      const systemRole = await this.prisma.role.findFirst({
        where: { restaurantId, systemKey: station },
      });
      roleId = systemRole?.id;
    } else {
      throw new BadRequestException('roleId or role is required');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        fullName: dto.fullName,
        role: station!,
        roleId,
        restaurantId,
      },
      include: {
        assignedRole: {
          select: { id: true, name: true, stationKey: true, isSystem: true },
        },
      },
    });
  }

  async findAll(restaurantId: string, query: FindUsersDto) {
    return this.prisma.user.findMany({
      where: {
        restaurantId,
        ...(query.role && { role: query.role }),
      },
      include: {
        assignedRole: {
          select: { id: true, name: true, stationKey: true, isSystem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, restaurantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, restaurantId },
      include: {
        assignedRole: {
          select: { id: true, name: true, stationKey: true, isSystem: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
