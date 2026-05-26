import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

import * as bcrypt from 'bcrypt';

import { PlatformLoginDto } from './dto/platform-login.dto';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';

import { UserRole } from '@prisma/client';

@Injectable()
export class PlatformService {
  constructor(
    private prisma: PrismaService,

    private jwtService: JwtService,
  ) {}

  async login(dto: PlatformLoginDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const admin = await this.prisma.platformAdmin.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!admin?.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: admin.id,
      type: 'platform-admin',
      email: admin.email,
    });

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
      },
    };
  }
  async createRestaurant(dto: CreateRestaurantDto) {
    const existingRestaurant = await this.prisma.restaurant.findUnique({
      where: {
        nit: dto.nit,
      },
    });

    if (existingRestaurant) {
      throw new BadRequestException('Restaurant already exists');
    }

    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        nit: dto.nit,
        phone: dto.phone,
        address: dto.address,

        users: {
          create: {
            email: dto.adminEmail,
            fullName: dto.adminName,
            passwordHash,
            role: UserRole.ADMIN,
          },
        },
      },

      include: {
        users: true,
      },
    });

    return restaurant;
  }

  async getRestaurants() {
    return this.prisma.restaurant.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      include: {
        users: true,
      },
    });
  }
}
