import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    role: string;
    restaurantId: string;
  };
  restaurantId?: string;
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user || !request.user.restaurantId) {
      throw new UnauthorizedException('Tenant not found');
    }

    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: request.user.restaurantId },
      select: { isActive: true },
    });

    if (!restaurant?.isActive) {
      throw new UnauthorizedException('Restaurant disabled');
    }

    request.restaurantId = request.user.restaurantId;

    return true;
  }
}
