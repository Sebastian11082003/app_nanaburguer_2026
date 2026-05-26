import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { PlatformController } from './platform.controller';

import { PlatformService } from './platform.service';

import { PlatformJwtStrategy } from './strategies/platform-jwt.strategy';

import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,

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
