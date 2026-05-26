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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

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
  // 🔐 LOGIN
  // ============================
  async login(slug: string, email: string, password: string) {
    // 1. Buscar restaurante por slug
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { slug },
    });

    if (!restaurant) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // 2. Buscar usuario dentro del tenant
    const user = await this.prisma.user.findFirst({
      where: { email, restaurantId: restaurant.id },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // 3. Verificar contraseña
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
