import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, OrderType } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../test/prisma-mock';
import { ReportsService } from './reports.service';

type Delegate = {
  findMany: jest.Mock;
  aggregate: jest.Mock;
  count: jest.Mock;
  groupBy: jest.Mock;
};

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ReportsService);
  });

  function sale(): Delegate {
    return prisma.sale as Delegate;
  }

  function payment(): Delegate {
    return prisma.payment as Delegate;
  }

  function order(): Delegate {
    return prisma.order as Delegate;
  }

  function delivery(): Delegate {
    return prisma.delivery as Delegate;
  }

  it('filters salesByDay to the requested UTC window', async () => {
    sale().findMany.mockResolvedValue([
      { createdAt: new Date('2026-09-02T10:00:00.000Z'), totalCents: 1000 },
    ]);

    await service.salesByDay('r1', {
      start: new Date('2026-09-01T00:00:00.000Z'),
      end: new Date('2026-09-03T23:59:59.999Z'),
    });

    expect(sale().findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          restaurantId: 'r1',
          createdAt: {
            gte: new Date('2026-09-01T00:00:00.000Z'),
            lte: new Date('2026-09-03T23:59:59.999Z'),
          },
        },
      }),
    );
  });

  it('groups orders by status for HU-023', async () => {
    order().groupBy.mockResolvedValue([
      { status: OrderStatus.CLOSED, _count: 4 },
      { status: OrderStatus.CREATED, _count: 1 },
    ]);

    await expect(service.ordersByStatus('r1')).resolves.toEqual([
      { status: OrderStatus.CLOSED, count: 4 },
      { status: OrderStatus.CREATED, count: 1 },
    ]);
  });

  it('splits delivery vs pickup in the channel summary', async () => {
    delivery().findMany.mockResolvedValue([
      {
        paymentMethod: 'CASH',
        order: { type: OrderType.DELIVERY, sale: { totalCents: 5000 } },
      },
      {
        paymentMethod: 'CARD',
        order: { type: OrderType.PICKUP, sale: { totalCents: 2000 } },
      },
    ]);

    await expect(service.deliverySummary('r1')).resolves.toEqual({
      totalDeliveries: 1,
      totalPickups: 1,
      totalRevenue: 5000,
      pickupRevenue: 2000,
      payments: { cash: 1, card: 0, transfer: 0 },
      pickupPayments: { cash: 0, card: 1, transfer: 0 },
    });
  });

  it('scopes payment-method totals to paidAt when a range is set', async () => {
    payment().groupBy.mockResolvedValue([]);

    await service.salesByPaymentMethod('r1', {
      start: new Date('2026-09-01T00:00:00.000Z'),
    });

    expect(payment().groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          restaurantId: 'r1',
          paidAt: { gte: new Date('2026-09-01T00:00:00.000Z') },
        },
      }),
    );
  });
});
