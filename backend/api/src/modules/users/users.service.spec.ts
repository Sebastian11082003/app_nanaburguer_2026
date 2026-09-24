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

  it('updates email when it is free', async () => {
    (prisma.user as Delegate).findFirst
      .mockResolvedValueOnce({
        id: 'u1',
        email: 'old@nana.test',
        role: UserRole.CASHIER,
        roleId: 'role-1',
      })
      .mockResolvedValueOnce(null);
    (prisma.restaurant as Delegate).findFirst.mockResolvedValue({
      email: 'nanaburguer-neiva@gmail.com',
    });
    (prisma.user as Delegate).update.mockResolvedValue({
      id: 'u1',
      email: 'caja@nana.test',
    });

    await service.update(
      'u1',
      { email: 'Caja@nana.test' },
      'r1',
      'actor-1',
    );

    expect((prisma.user as Delegate).update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'caja@nana.test' }),
      }),
    );
    expect((prisma.restaurant as Delegate).update).not.toHaveBeenCalled();
  });

  it('rejects a taken email', async () => {
    (prisma.user as Delegate).findFirst
      .mockResolvedValueOnce({
        id: 'u1',
        email: 'old@nana.test',
        role: UserRole.CASHIER,
        roleId: 'role-1',
      })
      .mockResolvedValueOnce({ id: 'other' });

    await expect(
      service.update('u1', { email: 'taken@nana.test' }, 'r1', 'actor-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('keeps restaurant Gmail in sync when that admin email changes', async () => {
    (prisma.user as Delegate).findFirst
      .mockResolvedValueOnce({
        id: 'u1',
        email: 'nanaburguer-neiva@gmail.com',
        role: UserRole.ADMIN,
        roleId: 'role-1',
      })
      .mockResolvedValueOnce(null);
    (prisma.restaurant as Delegate).findFirst.mockResolvedValue({
      email: 'nanaburguer-neiva@gmail.com',
    });
    (prisma.user as Delegate).update.mockResolvedValue({
      id: 'u1',
      email: 'nuevo@nana.test',
    });
    (prisma.restaurant as Delegate).update.mockResolvedValue({
      email: 'nuevo@nana.test',
    });

    await service.update(
      'u1',
      { email: 'nuevo@nana.test' },
      'r1',
      'actor-1',
    );

    expect((prisma.restaurant as Delegate).update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { email: 'nuevo@nana.test' },
    });
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
