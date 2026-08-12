import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import {
  PERMISSION_CATALOG,
  SYSTEM_ROLE_META,
  SYSTEM_ROLE_PERMISSIONS,
} from './permissions.catalog';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Ensures the global permission catalog exists (idempotent). */
  async ensurePermissionCatalog(
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    for (const def of PERMISSION_CATALOG) {
      await tx.permission.upsert({
        where: { code: def.code },
        create: {
          code: def.code,
          name: def.name,
          description: def.description,
          groupName: def.groupName,
        },
        update: {
          name: def.name,
          description: def.description,
          groupName: def.groupName,
        },
      });
    }
  }

  /**
   * Seeds/repairs the 5 system role templates for a tenant and backfills
   * users that still have `roleId` null.
   */
  async ensureDefaults(
    restaurantId: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    await this.ensurePermissionCatalog(tx);

    const permissions = await tx.permission.findMany();
    const byCode = new Map(permissions.map((p) => [p.code, p.id]));

    for (const systemKey of Object.values(UserRole)) {
      const meta = SYSTEM_ROLE_META[systemKey];
      const codes = SYSTEM_ROLE_PERMISSIONS[systemKey];

      let role = await tx.role.findFirst({
        where: { restaurantId, systemKey },
      });

      if (!role) {
        role = await tx.role.create({
          data: {
            restaurantId,
            name: meta.name,
            description: meta.description,
            systemKey,
            isSystem: true,
            stationKey: systemKey,
            isActive: true,
          },
        });
      }

      // Keep system templates in sync with the catalog defaults.
      await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
      const permissionIds = codes
        .map((code) => byCode.get(code))
        .filter((id): id is string => Boolean(id));

      if (permissionIds.length) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: role!.id,
            permissionId,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Backfill legacy users → system role matching their station enum.
    const users = await tx.user.findMany({
      where: { restaurantId, roleId: null },
      select: { id: true, role: true },
    });

    if (users.length) {
      const systemRoles = await tx.role.findMany({
        where: { restaurantId, isSystem: true },
      });
      const roleByKey = new Map(
        systemRoles.map((r) => [r.systemKey as UserRole, r.id]),
      );

      for (const user of users) {
        const roleId = roleByKey.get(user.role);
        if (!roleId) continue;
        await tx.user.update({
          where: { id: user.id },
          data: { roleId },
        });
      }
    }
  }

  async seedForRestaurant(
    restaurantId: string,
    tx: Prisma.TransactionClient,
  ) {
    await this.ensureDefaults(restaurantId, tx);
  }

  async listPermissions() {
    await this.ensurePermissionCatalog();
    return this.prisma.permission.findMany({
      orderBy: [{ groupName: 'asc' }, { name: 'asc' }],
    });
  }

  async findAll(restaurantId: string) {
    await this.ensureDefaults(restaurantId);

    return this.prisma.role.findMany({
      where: { restaurantId },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, restaurantId: string) {
    await this.ensureDefaults(restaurantId);

    const role = await this.prisma.role.findFirst({
      where: { id, restaurantId },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });

    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: CreateRoleDto, restaurantId: string) {
    await this.ensureDefaults(restaurantId);

    const existing = await this.prisma.role.findFirst({
      where: { restaurantId, name: dto.name.trim() },
    });
    if (existing) {
      throw new BadRequestException('Ya existe un rol con ese nombre');
    }

    const permissionIds = await this.resolvePermissionIds(
      dto.permissionCodes ?? [],
    );

    return this.prisma.role.create({
      data: {
        restaurantId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        stationKey: dto.stationKey,
        isSystem: false,
        systemKey: null,
        isActive: true,
        permissions: {
          create: permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });
  }

  async update(id: string, restaurantId: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findFirst({
      where: { id, restaurantId },
    });
    if (!role) throw new NotFoundException('Role not found');

    if (role.isSystem && dto.permissionCodes) {
      // Allow editing system template permissions (admin fine-tuning).
    }

    if (dto.name && dto.name.trim() !== role.name) {
      const clash = await this.prisma.role.findFirst({
        where: {
          restaurantId,
          name: dto.name.trim(),
          NOT: { id },
        },
      });
      if (clash) {
        throw new BadRequestException('Ya existe un rol con ese nombre');
      }
    }

    if (dto.isActive === false && role.isSystem) {
      throw new BadRequestException('No se pueden desactivar roles del sistema');
    }

    const stationKey = dto.stationKey ?? role.stationKey;

    return this.prisma.$transaction(async (tx) => {
      if (dto.permissionCodes) {
        const permissionIds = await this.resolvePermissionIds(
          dto.permissionCodes,
          tx,
        );
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (permissionIds.length) {
          await tx.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
          });
        }
      }

      const updated = await tx.role.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description.trim() || null }
            : {}),
          ...(dto.stationKey !== undefined
            ? { stationKey: dto.stationKey }
            : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
        include: {
          permissions: { include: { permission: true } },
          _count: { select: { users: true } },
        },
      });

      // Keep users' station enum in sync when stationKey changes.
      if (dto.stationKey && dto.stationKey !== role.stationKey) {
        await tx.user.updateMany({
          where: { roleId: id, restaurantId },
          data: { role: stationKey },
        });
      }

      return updated;
    });
  }

  async getPermissionCodesForUser(userId: string, restaurantId: string) {
    await this.ensureDefaults(restaurantId);

    const user = await this.prisma.user.findFirst({
      where: { id: userId, restaurantId },
      include: {
        assignedRole: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });

    if (!user) return [] as string[];

    if (user.assignedRole?.isActive) {
      return user.assignedRole.permissions.map((rp) => rp.permission.code);
    }

    // Fallback: system template by station enum.
    const systemRole = await this.prisma.role.findFirst({
      where: { restaurantId, systemKey: user.role },
      include: { permissions: { include: { permission: true } } },
    });

    return systemRole?.permissions.map((rp) => rp.permission.code) ?? [];
  }

  private async resolvePermissionIds(
    codes: string[],
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    if (!codes.length) return [] as string[];

    const unique = [...new Set(codes)];
    const rows = await tx.permission.findMany({
      where: { code: { in: unique } },
    });

    if (rows.length !== unique.length) {
      throw new BadRequestException('One or more permission codes are invalid');
    }

    return rows.map((r) => r.id);
  }
}
