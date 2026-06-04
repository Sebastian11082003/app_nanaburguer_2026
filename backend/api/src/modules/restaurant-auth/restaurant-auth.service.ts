import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class RestaurantAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(slug: string, email: string, password: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        slug,
        email,
        isActive: true,
      },
    });

    if (!restaurant) {
      throw new UnauthorizedException('Restaurant not found');
    }

    const validPassword = await bcrypt.compare(
      password,
      restaurant.restaurantPasswordHash ?? '',
    );

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: restaurant.id,
      type: 'restaurant',
    });

    return {
      accessToken,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
    };
  }
}
