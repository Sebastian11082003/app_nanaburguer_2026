import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    role: string;
    restaurantId: string;
  };
  restaurantId?: string;
}

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    if (!user?.restaurantId) {
      throw new UnauthorizedException('Tenant not found');
    }

    request.restaurantId = user.restaurantId;

    return true;
  }
}
