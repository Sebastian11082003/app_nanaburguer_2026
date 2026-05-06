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
import { RegisterRestaurantDto } from './dto/register-restaurant.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // ============================
  // 🏢 REGISTER RESTAURANT (ENTRY POINT SAAS)
  // ============================
  async registerRestaurant(dto: RegisterRestaurantDto) {
    const existing = await this.prisma.restaurant.findUnique({
      where: { nit: dto.nit },
    });

    if (existing) {
      throw new BadRequestException('Restaurant already exists');
    }

    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    return this.prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: dto.name,
          nit: dto.nit,
          phone: dto.phone,
          address: dto.address,
        },
      });

      const admin = await tx.user.create({
        data: {
          fullName: dto.adminName,
          email: dto.adminEmail,
          passwordHash,
          role: UserRole.ADMIN,
          restaurantId: restaurant.id,
          isActive: true,
        },
      });

      return this.buildAuthResponse(admin);
    });
  }

  // ============================
  // 👤 REGISTER USER (ADMIN ONLY)
  // ============================
  async register(dto: RegisterDto, restaurantId: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        restaurantId,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        role: dto.role ?? UserRole.WAITER,
        isActive: true,
        restaurantId,
      },
    });
  }

  // ============================
  // 🔐 LOGIN (SIN NIT)
  // ============================
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
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
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId, // 🔥 CLAVE MULTI-TENANT
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}
