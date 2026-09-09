import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../test/prisma-mock';
import { occupiesFloorChannel, TablesService } from './tables.service';

describe('occupiesFloorChannel', () => {
  it('ignores CREATED drafts with no live lines', () => {
    expect(
      occupiesFloorChannel({ status: OrderStatus.CREATED, items: [] }),
    ).toBe(false);
    expect(
      occupiesFloorChannel({
        status: OrderStatus.CREATED,
        items: [{ canceledAt: new Date() }],
      }),
    ).toBe(false);
  });

  it('counts CREATED tickets that still have products', () => {
    expect(
      occupiesFloorChannel({
        status: OrderStatus.CREATED,
        items: [{ canceledAt: null }],
      }),
    ).toBe(true);
  });

  it('ignores kitchen tickets whose lines were all canceled', () => {
    expect(
      occupiesFloorChannel({
        status: OrderStatus.SENT_TO_KITCHEN,
        items: [],
      }),
    ).toBe(false);
    expect(
      occupiesFloorChannel({
        status: OrderStatus.SENT_TO_KITCHEN,
        items: [{ canceledAt: new Date() }],
      }),
    ).toBe(false);
  });
});

describe('TablesService', () => {
  let service: TablesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TablesService);
  });

  it('does not paint Llevar/Domicilios occupied for empty CREATED drafts', async () => {
    (prisma.tableEntity as { findMany: jest.Mock }).findMany.mockResolvedValue(
      [],
    );
    (prisma.order as { findMany: jest.Mock }).findMany.mockResolvedValue([
      {
        type: 'PICKUP',
        totalCents: 0,
        status: OrderStatus.CREATED,
        items: [],
      },
      {
        type: 'PICKUP',
        totalCents: 5000,
        status: OrderStatus.CREATED,
        items: [{ canceledAt: null }],
      },
      {
        type: 'DELIVERY',
        totalCents: 0,
        status: OrderStatus.CREATED,
        items: [{ canceledAt: new Date() }],
      },
      {
        type: 'DELIVERY',
        totalCents: 3000,
        status: OrderStatus.SENT_TO_KITCHEN,
        items: [{ canceledAt: null }],
      },
    ]);

    const result = await service.floor('restaurant-1');

    expect(result.pickup).toEqual({ count: 1, totalCents: 5000 });
    expect(result.delivery).toEqual({ count: 1, totalCents: 3000 });
  });
});
