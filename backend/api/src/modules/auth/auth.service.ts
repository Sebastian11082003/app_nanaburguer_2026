import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '@prisma/client';

import { RegisterDto } from './dto/register.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly rolesService: RolesService,
  ) {}

  // ============================
  // 👤 REGISTER USER
  // ============================

  async register(dto: RegisterDto, restaurantId: string) {
    await this.rolesService.ensureDefaults(restaurantId);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        restaurantId,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const station = dto.role ?? UserRole.WAITER;
    const systemRole = await this.prisma.role.findFirst({
      where: { restaurantId, systemKey: station },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        role: station,
        roleId: systemRole?.id,
        isActive: true,
        restaurantId,
      },
    });
  }

  // ============================
  // 🔐 LOGIN POR ROL
  // ============================

  async login(
    slug: string,
    email: string,
    password: string,
    expectedRole: UserRole,
  ) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        slug,
      },
    });

    if (!restaurant) {
      throw new UnauthorizedException('Restaurant not found');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email,
        restaurantId: restaurant.id,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== expectedRole) {
      throw new UnauthorizedException('Role not allowed');
    }

    return this.buildAuthResponse(user);
  }

  // ============================
  // 🎟 JWT BUILDER
  // ============================

  private async buildAuthResponse(user: {
    id: string;
    email: string;
    role: UserRole;
    restaurantId: string;
    fullName: string;
    roleId?: string | null;
  }) {
    const permissions = await this.rolesService.getPermissionCodesForUser(
      user.id,
      user.restaurantId,
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      roleId: user.roleId ?? null,
      permissions,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        roleId: user.roleId ?? null,
        permissions,
      },
    };
  }
}
