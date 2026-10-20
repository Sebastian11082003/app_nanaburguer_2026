import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentMethod } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../test/prisma-mock';
import { CashService } from '../cashMovement/cash.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaMock;
  const paymentMethods = { assertActive: jest.fn() };
  const cash = { assertOpenSession: jest.fn() };

  const sale = {
    id: 'sale-1',
    totalCents: 31500,
    payment: null,
    restaurant: { name: 'Smoke', nit: '900', phone: null, address: null, logoUrl: null },
    order: {
      orderNumber: 11,
      type: 'DINE_IN',
      status: OrderStatus.CLOSED,
      subtotalCents: 30000,
      discountCents: 0,
      taxCents: 1500,
      createdById: 'u1',
      table: { label: 'M1' },
      delivery: null,
      items: [
        {
          canceledAt: null,
          quantity: 1,
          unitPriceCents: 15000,
          lineTotalCents: 15000,
          notes: null,
          menuItem: { name: 'Burger' },
        },
      ],
    },
  };

  beforeEach(async () => {
    prisma = createPrismaMock();
    paymentMethods.assertActive.mockReset().mockResolvedValue({ label: 'Transferencia' });
    cash.assertOpenSession.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PaymentMethodsService, useValue: paymentMethods },
        { provide: CashService, useValue: cash },
      ],
    }).compile();

    service = module.get(PaymentsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores the same invoice number on the row and the printed snapshot', async () => {
    let clock = 1792363818433;
    jest.spyOn(Date, 'now').mockImplementation(() => clock++);

    const delegates = prisma as Record<string, Record<string, jest.Mock>>;
    delegates.sale.findFirst.mockResolvedValue(sale);
    delegates.payment.create.mockResolvedValue({
      id: 'pay-1',
      method: PaymentMethod.TRANSFER,
      amountCents: 31500,
      tipCents: 0,
      currency: 'COP',
      paidAt: new Date(),
    });
    delegates.invoice.create.mockImplementation(({ data }) => data);

    await service.create(
      'sale-1',
      { method: PaymentMethod.TRANSFER, amountCents: 31500 },
      'r1',
      'u1',
    );

    const [{ data }] = delegates.invoice.create.mock.calls[0] as [
      { data: { number: string; responseJson: { invoice: { number: string } } } },
    ];
    expect(data.responseJson.invoice.number).toBe(data.number);
  });
});
