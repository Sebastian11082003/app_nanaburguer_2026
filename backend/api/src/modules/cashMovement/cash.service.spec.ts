import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CashSessionStatus,
  CashType,
  PaymentMethod,
} from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../test/prisma-mock';
import { SALE_PAYMENT_CONCEPT } from './cash.constants';
import { CashService } from './cash.service';

type Delegate = {
  findFirst: jest.Mock;
  findMany: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  groupBy: jest.Mock;
};

describe('CashService', () => {
  let service: CashService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CashService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CashService);
  });

  function sessionDelegate(): Delegate {
    return prisma.cashSession as Delegate;
  }

  function paymentDelegate(): Delegate {
    return prisma.payment as Delegate;
  }

  function movementDelegate(): Delegate {
    return prisma.cashMovement as Delegate;
  }

  describe('openSession', () => {
    it('rejects a second open session for the same tenant', async () => {
      sessionDelegate().findFirst.mockResolvedValue({ id: 'open-1' });

      await expect(
        service.openSession({ openingCents: 10000 }, 'r1', 'u1'),
      ).rejects.toThrow(BadRequestException);
      expect(sessionDelegate().create).not.toHaveBeenCalled();
    });

    it('opens a session with the opening float', async () => {
      sessionDelegate().findFirst.mockResolvedValue(null);
      const created = { id: 's1', status: CashSessionStatus.OPEN };
      sessionDelegate().create.mockResolvedValue(created);

      await expect(
        service.openSession({ openingCents: 50000 }, 'r1', 'u1'),
      ).resolves.toEqual(created);

      expect(sessionDelegate().create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            restaurantId: 'r1',
            openedById: 'u1',
            openingCents: 50000,
            status: CashSessionStatus.OPEN,
          }),
        }),
      );
    });
  });

  describe('computePreview', () => {
    it('uses payments for sales and ignores SALE_PAYMENT movements', async () => {
      paymentDelegate().groupBy.mockResolvedValue([
        {
          method: PaymentMethod.CASH,
          _sum: { amountCents: 20000 },
          _count: 2,
        },
        {
          method: PaymentMethod.CARD,
          _sum: { amountCents: 15000 },
          _count: 1,
        },
      ]);
      movementDelegate().findMany.mockResolvedValue([
        { type: CashType.INCOME, amountCents: 3000 },
        { type: CashType.EXPENSE, amountCents: 1000 },
      ]);

      const preview = await service.computePreview(
        'r1',
        new Date('2026-09-04T10:00:00.000Z'),
        new Date('2026-09-04T18:00:00.000Z'),
        10000,
      );

      expect(movementDelegate().findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            NOT: { concept: SALE_PAYMENT_CONCEPT },
          }),
        }),
      );
      expect(preview.salesTotalCents).toBe(35000);
      expect(preview.cashSalesCents).toBe(20000);
      expect(preview.cardSalesCents).toBe(15000);
      expect(preview.manualIncomeCents).toBe(3000);
      expect(preview.expenseCents).toBe(1000);
      // opening + cash sales + manual income - expenses
      expect(preview.expectedCashCents).toBe(32000);
    });
  });

  describe('closeSession', () => {
    it('throws NotFound when the session is not in the tenant', async () => {
      sessionDelegate().findFirst.mockResolvedValue(null);

      await expect(
        service.closeSession('s1', {}, 'r1', 'u1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects closing an already closed session', async () => {
      sessionDelegate().findFirst.mockResolvedValue({
        id: 's1',
        status: CashSessionStatus.CLOSED,
      });

      await expect(
        service.closeSession('s1', {}, 'r1', 'u1'),
      ).rejects.toThrow('Cash session is already closed');
    });

    it('freezes the preview and stores counted vs expected', async () => {
      const openedAt = new Date('2026-09-04T10:00:00.000Z');
      sessionDelegate().findFirst.mockResolvedValue({
        id: 's1',
        restaurantId: 'r1',
        status: CashSessionStatus.OPEN,
        openedAt,
        openingCents: 10000,
        notes: null,
      });
      paymentDelegate().groupBy.mockResolvedValue([
        {
          method: PaymentMethod.CASH,
          _sum: { amountCents: 5000 },
          _count: 1,
        },
      ]);
      movementDelegate().findMany.mockResolvedValue([]);
      const closed = { id: 's1', status: CashSessionStatus.CLOSED };
      sessionDelegate().update.mockResolvedValue(closed);

      const result = await service.closeSession(
        's1',
        { countedCents: 14000 },
        'r1',
        'u2',
      );

      expect(result).toEqual(closed);
      expect(sessionDelegate().update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: CashSessionStatus.CLOSED,
            closedById: 'u2',
            countedCents: 14000,
            cashSalesCents: 5000,
            expectedCashCents: 15000,
            differenceCents: -1000,
          }),
        }),
      );
    });
  });

  describe('currentSession', () => {
    it('returns nulls when no shift is open', async () => {
      sessionDelegate().findFirst.mockResolvedValue(null);

      await expect(service.currentSession('r1')).resolves.toEqual({
        session: null,
        preview: null,
      });
    });
  });
});
