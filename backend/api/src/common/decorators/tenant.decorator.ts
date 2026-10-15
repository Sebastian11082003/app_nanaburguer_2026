import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithTenant extends Request {
  restaurantId?: string;
}

export const Tenant = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithTenant>();

    if (!request.restaurantId) {
      throw new Error(
        'Tenant not found in request. Did you forget TenantGuard?',
      );
    }

    return request.restaurantId;
  },
);
