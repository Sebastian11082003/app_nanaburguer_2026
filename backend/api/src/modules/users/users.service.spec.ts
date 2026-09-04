import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../test/prisma-mock';
import { RolesService } from '../roles/roles.service';
import { UsersService } from './users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaMock;
  const rolesService = {
    ensureDefaults: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    prisma = createPrismaMock();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: RolesService, useValue: rolesService },
      ],
    }).compile();

    service = module.get(UsersService);
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    rolesService.ensureDefaults.mockResolvedValue(undefined);
  });

  type Delegate = {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
  };

  it('provisions only the stations that are still missing', async () => {
    (prisma.restaurant as Delegate).findFirst.mockResolvedValue({
      slug: 'nana-neiva',
    });
    (prisma.user as Delegate).findMany.mockResolvedValue([
      { role: UserRole.ADMIN },
      { role: UserRole.WAITER },
    ]);
    (prisma.user as Delegate).findFirst.mockResolvedValue(null);
    (prisma.role as Delegate).findFirst.mockResolvedValue({ id: 'role-1' });
    (prisma.user as Delegate).create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: data.email,
        email: data.email,
        role: data.role,
      }),
    );

    const result = await service.provisionStationStaff('r1', 'secret1');

    expect(result.skipped).toEqual([UserRole.WAITER]);
    expect(result.created.map((row) => row.role)).toEqual([
      UserRole.CASHIER,
      UserRole.KITCHEN,
      UserRole.DELIVERY,
    ]);
    expect((prisma.user as Delegate).create).toHaveBeenCalledTimes(3);
  });

  it('refuses a station email that already exists globally', async () => {
    (prisma.restaurant as Delegate).findFirst.mockResolvedValue({
      slug: 'nana-neiva',
    });
    (prisma.user as Delegate).findMany.mockResolvedValue([
      { role: UserRole.ADMIN },
    ]);
    (prisma.user as Delegate).findFirst.mockResolvedValue({ id: 'other' });
    (prisma.role as Delegate).findFirst.mockResolvedValue({ id: 'role-1' });

    await expect(
      service.provisionStationStaff('r1', 'secret1'),
    ).rejects.toThrow(BadRequestException);
  });
});
