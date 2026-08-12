import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface RequestUser {
  userId: string;
  email: string;
  role: string;
  restaurantId: string;
  permissions?: string[];
}

/**
 * Fine-grained check used together with RolesGuard.
 * If the handler has no @Permissions(), this guard is a no-op.
 * If the JWT has no permissions claim yet (legacy token), allow and rely on @Roles.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    // Legacy tokens without permissions: fall back to station role checks only.
    if (!user.permissions || user.permissions.length === 0) {
      return true;
    }

    const ok = required.some((code) => user.permissions!.includes(code));
    if (!ok) {
      throw new ForbiddenException('Missing required permission');
    }

    return true;
  }
}
