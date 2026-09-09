import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RolesService } from '../roles/roles.service';
import { createPrismaMock, PrismaMock } from '../../test/prisma-mock';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMock;
  const jwtSign = jest.fn().mockResolvedValue('signed-jwt-token');

  const rolesService = {
    ensureDefaults: jest.fn().mockResolvedValue(undefined),
    getPermissionCodesForUser: jest
      .fn()
      .mockResolvedValue(['USERS_MANAGE']),
  };

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { signAsync: jwtSign } },
        { provide: RolesService, useValue: rolesService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    const baseArgs = ['nana-burger', 'admin@nana.com', 'secret123', UserRole.ADMIN] as const;

    it('throws Unauthorized when the restaurant does not exist', async () => {
      (prisma.restaurant as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(service.login(...baseArgs)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(...baseArgs)).rejects.toThrow('Restaurant not found');
    });

    it('throws Unauthorized when the user does not exist for that tenant', async () => {
      (prisma.restaurant as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'restaurant-1',
      });
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(service.login(...baseArgs)).rejects.toThrow('Invalid credentials');
    });

    it('throws Unauthorized when the password does not match', async () => {
      (prisma.restaurant as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'restaurant-1',
      });
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'admin@nana.com',
        passwordHash: 'hashed',
        role: UserRole.ADMIN,
        restaurantId: 'restaurant-1',
        fullName: 'Admin',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(...baseArgs)).rejects.toThrow('Invalid credentials');
    });

    it('throws Unauthorized when the role does not match the expected one', async () => {
      (prisma.restaurant as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'restaurant-1',
      });
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'admin@nana.com',
        passwordHash: 'hashed',
        role: UserRole.WAITER,
        restaurantId: 'restaurant-1',
        fullName: 'Waiter',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(...baseArgs)).rejects.toThrow('Role not allowed');
    });

    it('returns an access token and user payload on success', async () => {
      (prisma.restaurant as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'restaurant-1',
      });
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'admin@nana.com',
        passwordHash: 'hashed',
        role: UserRole.ADMIN,
        restaurantId: 'restaurant-1',
        fullName: 'Admin',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(...baseArgs);

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.user).toEqual({
        id: 'user-1',
        fullName: 'Admin',
        email: 'admin@nana.com',
        role: UserRole.ADMIN,
        roleId: null,
        permissions: ['USERS_MANAGE'],
      });
      expect(jwtSign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'admin@nana.com',
        role: UserRole.ADMIN,
        restaurantId: 'restaurant-1',
        roleId: null,
        permissions: ['USERS_MANAGE'],
      });
    });

    it('scopes the user lookup to the resolved tenant (no cross-tenant leakage)', async () => {
      (prisma.restaurant as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'restaurant-1',
      });
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(service.login(...baseArgs)).rejects.toThrow();

      expect(prisma.user as { findFirst: jest.Mock }).toHaveProperty('findFirst');
      const [[callArgs]] = (prisma.user as { findFirst: jest.Mock }).findFirst.mock.calls;
      expect(callArgs.where.restaurantId).toBe('restaurant-1');
    });
  });

  describe('register', () => {
    it('throws BadRequest when the email already exists for the tenant', async () => {
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'existing-user',
      });

      await expect(
        service.register(
          { email: 'dup@nana.com', fullName: 'Dup', password: 'secret123' },
          'restaurant-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('hashes the password and creates the user scoped to the tenant', async () => {
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user as { create: jest.Mock }).create.mockResolvedValue({
        id: 'new-user',
      });

      await service.register(
        {
          email: 'new@nana.com',
          fullName: 'New Waiter',
          password: 'secret123',
          role: UserRole.WAITER,
        },
        'restaurant-1',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
      const [[createArgs]] = (prisma.user as { create: jest.Mock }).create.mock.calls;
      expect(createArgs.data).toMatchObject({
        email: 'new@nana.com',
        passwordHash: 'hashed-password',
        role: UserRole.WAITER,
        restaurantId: 'restaurant-1',
      });
    });
  });

  describe('staffLogin', () => {
    it('returns JWT, user and restaurant without a role picker', async () => {
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'cashier@nana.test',
        passwordHash: 'hashed',
        role: UserRole.CASHIER,
        restaurantId: 'restaurant-1',
        fullName: 'Cajero',
        isActive: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prisma.restaurant as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'restaurant-1',
        name: 'Nana',
        slug: 'nana',
        logoUrl: '/logo/nana-logo.jpeg',
      });

      const result = await service.staffLogin('cashier@nana.test', 'secret123');

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.user.role).toBe(UserRole.CASHIER);
      expect(result.restaurant.slug).toBe('nana');
      expect(result.restaurant.logoUrl).toBe('/logo/nana-logo.jpeg');
    });

    it('lets the restaurant contact email in as ADMIN when no staff user exists', async () => {
      (prisma.user as { findFirst: jest.Mock }).findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (prisma.restaurant as { findFirst: jest.Mock }).findFirst
        .mockResolvedValueOnce({
          id: 'restaurant-1',
          name: 'Nanaburguer',
          email: 'nanaburguer-neiva@gmail.com',
          restaurantPasswordHash: 'rest-hash',
          isActive: true,
        })
        .mockResolvedValueOnce({
          id: 'restaurant-1',
          name: 'Nanaburguer',
          slug: 'nanaburguer',
          logoUrl: null,
        });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prisma.role as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'role-admin',
      });
      (prisma.user as { create: jest.Mock }).create.mockResolvedValue({
        id: 'admin-1',
        email: 'nanaburguer-neiva@gmail.com',
        passwordHash: 'rest-hash',
        role: UserRole.ADMIN,
        restaurantId: 'restaurant-1',
        fullName: 'Nanaburguer',
        roleId: 'role-admin',
        isActive: true,
      });

      const result = await service.staffLogin(
        'nanaburguer-neiva@gmail.com',
        'secret123',
      );

      expect(result.user.role).toBe(UserRole.ADMIN);
      expect(result.restaurant.slug).toBe('nanaburguer');
      expect((prisma.user as { create: jest.Mock }).create).toHaveBeenCalled();
    });

    it('rejects invalid credentials', async () => {
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);
      (prisma.restaurant as { findFirst: jest.Mock }).findFirst.mockResolvedValue(
        null,
      );
      await expect(
        service.staffLogin('nobody@nana.test', 'secret123'),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('forgotPassword', () => {
    it('does not leak whether the email exists', async () => {
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);
      const result = await service.forgotPassword('missing@nana.test');
      expect(result).toEqual({ ok: true });
      expect(
        (prisma.passwordResetToken as { create: jest.Mock }).create,
      ).not.toHaveBeenCalled();
    });

    it('returns a local resetUrl when the user exists', async () => {
      (prisma.user as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'cashier@nana.test',
        isActive: true,
      });
      (prisma.passwordResetToken as { create: jest.Mock }).create.mockResolvedValue(
        {},
      );

      const result = await service.forgotPassword('cashier@nana.test');
      expect(result.ok).toBe(true);
      expect(result.resetUrl).toMatch(/^\/restaurant\/reset\?token=/);
    });
  });

  describe('resetPassword', () => {
    it('rejects an unknown token', async () => {
      (
        prisma.passwordResetToken as { findFirst: jest.Mock }
      ).findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword('a'.repeat(32), 'newpass'),
      ).rejects.toThrow('Invalid or expired reset token');
    });
  });
});
