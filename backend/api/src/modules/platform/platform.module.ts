import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { PlatformController } from './platform.controller';

import { PlatformService } from './platform.service';

import { PlatformJwtStrategy } from './strategies/platform-jwt.strategy';

import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PrismaModule,
    PaymentMethodsModule,
    RolesModule,
    UsersModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET,

      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],

  controllers: [PlatformController],

  providers: [PlatformService, PlatformJwtStrategy],
})
export class PlatformModule {}
