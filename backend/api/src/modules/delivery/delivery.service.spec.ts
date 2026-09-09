import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';

import { DeliveryService } from './delivery.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../test/prisma-mock';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DeliveryService);
  });

  describe('dispatch', () => {
    it('rejects a CREATED draft so caja cannot send an unfinished ticket', async () => {
      (prisma.delivery as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'del-1',
        order: { status: OrderStatus.CREATED },
      });

      await expect(
        service.dispatch('del-1', 'restaurant-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
      expect((prisma.delivery as { update: jest.Mock }).update).not.toHaveBeenCalled();
    });

    it('rejects a CANCELED order', async () => {
      (prisma.delivery as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'del-1',
        order: { status: OrderStatus.CANCELED },
      });

      await expect(
        service.dispatch('del-1', 'restaurant-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('dispatches a prepaid CLOSED ticket', async () => {
      (prisma.delivery as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'del-1',
        order: { status: OrderStatus.CLOSED },
      });
      (prisma.delivery as { update: jest.Mock }).update.mockResolvedValue({
        id: 'del-1',
        status: 'DISPATCHED',
      });

      await service.dispatch('del-1', 'restaurant-1', 'user-1');

      expect((prisma.delivery as { update: jest.Mock }).update).toHaveBeenCalled();
    });

    it('throws when the delivery is not in the tenant', async () => {
      (prisma.delivery as { findFirst: jest.Mock }).findFirst.mockResolvedValue(
        null,
      );

      await expect(
        service.dispatch('del-1', 'restaurant-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
