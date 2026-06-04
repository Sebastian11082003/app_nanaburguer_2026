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
  // 👤 REGISTER USER
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
  // 🔐 LOGIN POR ROL
  // ============================

  async login(
    slug: string,
    email: string,
    password: string,
    expectedRole: UserRole,
  ) {
    console.log('============== LOGIN ==============');
    console.log('SLUG:', slug);
    console.log('EMAIL:', email);
    console.log('PASSWORD:', password);
    console.log('ROLE:', expectedRole);
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        slug,
      },
    });

    console.log('RESTAURANT:', restaurant);

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

    console.log('USER:', user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    console.log('PASSWORD VALID:', validPassword);
    console.log('USER ROLE:', user.role);

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
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
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
