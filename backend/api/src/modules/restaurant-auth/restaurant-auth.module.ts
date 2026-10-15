import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { RestaurantAuthController } from './restaurant-auth.controller';
import { RestaurantAuthService } from './restaurant-auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [RestaurantAuthController],
  providers: [RestaurantAuthService, PrismaService],
})
export class RestaurantAuthModule {}
