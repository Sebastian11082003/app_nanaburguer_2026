import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../test/prisma-mock';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMock;
  const jwtSign = jest.fn().mockResolvedValue('signed-jwt-token');

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { signAsync: jwtSign } },
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
      });
      expect(jwtSign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'admin@nana.com',
        role: UserRole.ADMIN,
        restaurantId: 'restaurant-1',
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
});
