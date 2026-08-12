import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  function makeGuard(requiredRoles: UserRole[] | undefined) {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
    } as unknown as Reflector;

    return new RolesGuard(reflector);
  }

  function makeContext(request: Record<string, unknown>): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  it('allows the request through when the route has no role restriction', () => {
    const guard = makeGuard(undefined);
    const context = makeContext({});

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws Forbidden when roles are required but there is no authenticated user', () => {
    const guard = makeGuard([UserRole.ADMIN]);
    const context = makeContext({});

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('denies access when the user role is not in the allowed list', () => {
    const guard = makeGuard([UserRole.ADMIN, UserRole.CASHIER]);
    const context = makeContext({ user: { role: UserRole.WAITER } });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('grants access when the user role is in the allowed list', () => {
    const guard = makeGuard([UserRole.ADMIN, UserRole.CASHIER]);
    const context = makeContext({ user: { role: UserRole.CASHIER } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies KITCHEN from cash-only endpoints even with a valid session', () => {
    const guard = makeGuard([UserRole.ADMIN, UserRole.CASHIER]);
    const context = makeContext({ user: { role: UserRole.KITCHEN } });

    expect(guard.canActivate(context)).toBe(false);
  });
});
