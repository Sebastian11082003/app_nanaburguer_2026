import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

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

describe('TenantGuard', () => {
  it('allows public routes without checking the user', () => {
    const request: Record<string, unknown> = {};
    const { context, reflector } = buildContext(request, true);
    const guard = new TenantGuard(reflector);

    expect(guard.canActivate(context)).toBe(true);
    expect(request.restaurantId).toBeUndefined();
  });

  it('rejects requests with no authenticated user', () => {
    const { context, reflector } = buildContext({});
    const guard = new TenantGuard(reflector);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects requests where the user has no restaurantId (no tenant context)', () => {
    const { context, reflector } = buildContext({
      user: { userId: 'user-1', role: 'ADMIN' },
    });
    const guard = new TenantGuard(reflector);

    expect(() => guard.canActivate(context)).toThrow('Tenant not found');
  });

  it('injects restaurantId into the request from the authenticated JWT user', () => {
    const request: Record<string, unknown> = {
      user: { userId: 'user-1', role: 'ADMIN', restaurantId: 'restaurant-1' },
    };
    const { context, reflector } = buildContext(request);
    const guard = new TenantGuard(reflector);

    expect(guard.canActivate(context)).toBe(true);
    expect(request.restaurantId).toBe('restaurant-1');
  });

  it('never trusts a restaurantId set only on the request itself, only the JWT user', () => {
    // Regression guard: an attacker (or a buggy handler) setting
    // request.restaurantId directly must not bypass tenant resolution.
    const request: Record<string, unknown> = {
      restaurantId: 'attacker-controlled-tenant',
      user: { userId: 'user-1', role: 'ADMIN', restaurantId: 'real-tenant' },
    };
    const { context, reflector } = buildContext(request);
    const guard = new TenantGuard(reflector);

    guard.canActivate(context);

    expect(request.restaurantId).toBe('real-tenant');
  });
});
