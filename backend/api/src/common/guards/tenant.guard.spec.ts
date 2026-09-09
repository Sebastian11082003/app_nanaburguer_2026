import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { TenantGuard } from './tenant.guard';

function buildContext(
  request: Record<string, unknown>,
  isPublic = false,
): { context: ExecutionContext; reflector: Reflector } {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(isPublic),
  } as unknown as Reflector;

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;

  return { context, reflector };
}

function prismaWith(isActive: boolean | null) {
  return {
    restaurant: {
      findFirst: jest.fn().mockResolvedValue(
        isActive === null ? null : { isActive },
      ),
    },
  } as unknown as PrismaService;
}

describe('TenantGuard', () => {
  it('allows public routes without checking the user', async () => {
    const request: Record<string, unknown> = {};
    const { context, reflector } = buildContext(request, true);
    const guard = new TenantGuard(reflector, prismaWith(true));

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.restaurantId).toBeUndefined();
  });

  it('rejects requests with no authenticated user', async () => {
    const { context, reflector } = buildContext({});
    const guard = new TenantGuard(reflector, prismaWith(true));

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects requests where the user has no restaurantId (no tenant context)', async () => {
    const { context, reflector } = buildContext({
      user: { userId: 'user-1', role: 'ADMIN' },
    });
    const guard = new TenantGuard(reflector, prismaWith(true));

    await expect(guard.canActivate(context)).rejects.toThrow('Tenant not found');
  });

  it('injects restaurantId into the request from the authenticated JWT user', async () => {
    const request: Record<string, unknown> = {
      user: { userId: 'user-1', role: 'ADMIN', restaurantId: 'restaurant-1' },
    };
    const { context, reflector } = buildContext(request);
    const guard = new TenantGuard(reflector, prismaWith(true));

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.restaurantId).toBe('restaurant-1');
  });

  it('never trusts a restaurantId set only on the request itself, only the JWT user', async () => {
    const request: Record<string, unknown> = {
      restaurantId: 'attacker-controlled-tenant',
      user: { userId: 'user-1', role: 'ADMIN', restaurantId: 'real-tenant' },
    };
    const { context, reflector } = buildContext(request);
    const guard = new TenantGuard(reflector, prismaWith(true));

    await guard.canActivate(context);

    expect(request.restaurantId).toBe('real-tenant');
  });

  it('rejects staff of a restaurant the platform turned off', async () => {
    const { context, reflector } = buildContext({
      user: { userId: 'user-1', role: 'ADMIN', restaurantId: 'restaurant-1' },
    });
    const guard = new TenantGuard(reflector, prismaWith(false));

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Restaurant disabled',
    );
  });
});
