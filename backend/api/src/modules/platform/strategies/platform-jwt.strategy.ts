import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PlatformJwtStrategy extends PassportStrategy(
  Strategy,
  'platform-jwt',
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: { sub: string; email: string; type: string }) {
    const admin = await this.prisma.platformAdmin.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!admin) {
      throw new UnauthorizedException();
    }

    return {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
    };
  }
}
