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
import { UpdateUserDto } from './dto/update-user.dto';
import { STATION_STAFF, stationStaffEmail } from './station-staff';

/** Never serialize passwordHash. Same shape for create/list/get/patch. */
const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  roleId: true,
  isActive: true,
  createdAt: true,
  assignedRole: {
    select: { id: true, name: true, stationKey: true, isSystem: true },
  },
} as const;

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
      select: USER_PUBLIC_SELECT,
    });
  }

  async findAll(restaurantId: string, query: FindUsersDto) {
    return this.prisma.user.findMany({
      where: {
        restaurantId,
        ...(query.role && { role: query.role }),
      },
      select: USER_PUBLIC_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, restaurantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, restaurantId },
      select: USER_PUBLIC_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Admin edits identity/role/active flag. Actor cannot deactivate
   * themselves — that would lock the only admin out of the panel.
   */
  async update(
    id: string,
    dto: UpdateUserDto,
    restaurantId: string,
    actorId: string,
  ) {
    const existing = await this.prisma.user.findFirst({
      where: { id, restaurantId },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (dto.isActive === false && id === actorId) {
      throw new BadRequestException('Cannot deactivate your own user');
    }

    let station = existing.role;
    let roleId = existing.roleId;

    if (dto.roleId) {
      const assigned = await this.prisma.role.findFirst({
        where: { id: dto.roleId, restaurantId, isActive: true },
      });
      if (!assigned) {
        throw new BadRequestException('Role not found');
      }
      station = assigned.stationKey;
      roleId = assigned.id;
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.roleId ? { roleId, role: station } : {}),
        ...(dto.password
          ? { passwordHash: await bcrypt.hash(dto.password, 10) }
          : {}),
      },
      select: USER_PUBLIC_SELECT,
    });
  }

  /**
   * Creates the four station logins that a new tenant otherwise lacks
   * (only ADMIN is created at signup). Skips a station if that role
   * already has a user so this is safe to re-run.
   */
  async provisionStationStaff(restaurantId: string, password: string) {
    await this.rolesService.ensureDefaults(restaurantId);

    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId },
      select: { slug: true },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const existing = await this.prisma.user.findMany({
      where: { restaurantId },
      select: { role: true },
    });
    const present = new Set(existing.map((row) => row.role));
    const passwordHash = await bcrypt.hash(password, 10);
    const created: Array<
      Awaited<ReturnType<UsersService['create']>>
    > = [];
    const skipped: UserRole[] = [];

    for (const station of STATION_STAFF) {
      if (present.has(station.role)) {
        skipped.push(station.role);
        continue;
      }

      const systemRole = await this.prisma.role.findFirst({
        where: { restaurantId, systemKey: station.role },
      });
      const email = stationStaffEmail(station.prefix, restaurant.slug);

      const taken = await this.prisma.user.findFirst({
        where: { email },
        select: { id: true },
      });
      if (taken) {
        throw new BadRequestException(`Email already exists: ${email}`);
      }

      created.push(
        await this.prisma.user.create({
          data: {
            email,
            passwordHash,
            fullName: station.fullName,
            role: station.role,
            roleId: systemRole?.id,
            restaurantId,
          },
          select: USER_PUBLIC_SELECT,
        }),
      );
    }

    return { created, skipped };
  }
}
