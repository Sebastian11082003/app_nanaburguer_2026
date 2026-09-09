import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '@prisma/client';

import { parseEnvFlag } from '../../config/env.schema';
import { RegisterDto } from './dto/register.dto';
import { RolesService } from '../roles/roles.service';

const RESET_TTL_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly rolesService: RolesService,
    private readonly config: ConfigService,
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

  /**
   * Same login for every station (Loggro-style). Email is globally unique,
   * so the tenant is resolved from the user — no slug, no role picker.
   *
   * The restaurant row also has an email (set when the tenant is created).
   * Operators treat that as the restaurant admin. If there is no User yet
   * for that address, we verify `restaurantPasswordHash` and provision an
   * ADMIN so they can enter the POS and create the other roles.
   */
  async staffLogin(email: string, password: string) {
    const normalized = email.trim().toLowerCase();

    let user = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalized, mode: 'insensitive' },
        isActive: true,
      },
    });

    if (user) {
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else {
      user = await this.loginRestaurantAdmin(normalized, password);
    }

    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: user.restaurantId, isActive: true },
      select: { id: true, name: true, slug: true, logoUrl: true },
    });

    if (!restaurant) {
      throw new UnauthorizedException('Restaurant not found');
    }

    const auth = await this.buildAuthResponse(user);
    return { ...auth, restaurant };
  }

  /**
   * Tenant contact email + restaurant password → ADMIN staff session.
   * Reuses the stored hash; does not create a second password.
   */
  private async loginRestaurantAdmin(email: string, password: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        isActive: true,
      },
    });

    if (!restaurant?.restaurantPasswordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(
      password,
      restaurant.restaurantPasswordHash,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const existing = await this.prisma.user.findFirst({
      where: {
        email: { equals: restaurant.email ?? email, mode: 'insensitive' },
      },
    });
    if (existing) {
      if (existing.restaurantId !== restaurant.id || !existing.isActive) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return existing;
    }

    await this.rolesService.ensureDefaults(restaurant.id);
    const adminRole = await this.prisma.role.findFirst({
      where: { restaurantId: restaurant.id, systemKey: UserRole.ADMIN },
    });

    return this.prisma.user.create({
      data: {
        fullName: restaurant.name,
        email: (restaurant.email ?? email).toLowerCase(),
        passwordHash: restaurant.restaurantPasswordHash,
        role: UserRole.ADMIN,
        roleId: adminRole?.id,
        restaurantId: restaurant.id,
        isActive: true,
      },
    });
  }

  /**
   * Always returns ok so we do not leak whether the email exists.
   * Local/dev (`ALLOW_INSECURE_DEFAULTS`) also returns `resetUrl` so the
   * flow can be tested without SMTP.
   */
  async forgotPassword(email: string) {
    const generic = { ok: true as const };
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: email.trim(), mode: 'insensitive' },
        isActive: true,
      },
    });

    if (!user) {
      return generic;
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });

    const allowInsecure = parseEnvFlag(
      this.config.get('ALLOW_INSECURE_DEFAULTS'),
      false,
    );
    if (!allowInsecure) {
      return generic;
    }

    return { ...generic, resetUrl: `/restaurant/reset?token=${token}` };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const row = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash },
    });

    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      });
      await tx.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      });
    });

    return { ok: true };
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
