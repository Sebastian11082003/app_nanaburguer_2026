import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

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
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    console.log('TENANT GUARD USER:', request.user);
    if (!request.user || !request.user.restaurantId) {
      throw new UnauthorizedException('Tenant not found');
    }

    // 🔥 CLAVE: setear tenant para el decorator
    request.restaurantId = request.user.restaurantId;

    return true;
  }
}
