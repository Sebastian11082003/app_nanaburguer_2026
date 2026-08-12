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

import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class PlatformService {
  constructor(
    private prisma: PrismaService,

    private jwtService: JwtService,

    private paymentMethodsService: PaymentMethodsService,

    private rolesService: RolesService,
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
    const restaurantEmail = dto.restaurantEmail.trim().toLowerCase();

    const adminEmail = dto.adminEmail.trim().toLowerCase();

    if (restaurantEmail === adminEmail) {
      throw new BadRequestException(
        'Restaurant email and admin email must be different',
      );
    }

    const existingRestaurant = await this.prisma.restaurant.findFirst({
      where: {
        OR: [
          {
            nit: dto.nit,
          },
          {
            slug: dto.slug,
          },
          {
            email: restaurantEmail,
          },
        ],
      },
    });

    if (existingRestaurant) {
      throw new BadRequestException('Restaurant already exists');
    }

    const existingAdmin = await this.prisma.user.findFirst({
      where: {
        email: adminEmail,
      },
    });

    if (existingAdmin) {
      throw new BadRequestException('Admin email already exists');
    }

    const restaurantPasswordHash = await bcrypt.hash(
      dto.restaurantPassword,
      10,
    );

    const adminPasswordHash = await bcrypt.hash(dto.adminPassword, 10);

    const restaurant = await this.prisma.$transaction(async (tx) => {
      const createdRestaurant = await tx.restaurant.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          nit: dto.nit,

          email: restaurantEmail,
          restaurantPasswordHash,

          phone: dto.phone,
          address: dto.address,

          logoUrl: dto.logoUrl,
          primaryColor: dto.primaryColor,
        },
      });

      await this.paymentMethodsService.seedForRestaurant(
        createdRestaurant.id,
        tx,
      );

      await this.rolesService.seedForRestaurant(createdRestaurant.id, tx);

      const adminRole = await tx.role.findFirst({
        where: {
          restaurantId: createdRestaurant.id,
          systemKey: UserRole.ADMIN,
        },
      });

      await tx.user.create({
        data: {
          fullName: dto.adminName,
          email: adminEmail,
          passwordHash: adminPasswordHash,

          role: UserRole.ADMIN,
          roleId: adminRole?.id,

          restaurantId: createdRestaurant.id,
        },
      });

      return createdRestaurant;
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
