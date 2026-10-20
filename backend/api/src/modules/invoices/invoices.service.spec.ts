import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceStatus } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../test/prisma-mock';
import { BILLING_PROVIDER } from './billing-provider';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: PrismaMock;
  const billing = {
    issue: jest.fn(),
    reject: jest.fn(),
  };

  const pending = {
    id: 'inv-1',
    number: 'INV-1',
    status: InvoiceStatus.PENDING,
    totalCents: 15000,
    currency: 'COP',
    cufe: null,
    responseJson: {
      items: [{ name: 'Burger', quantity: 1, total: 15000 }],
      restaurant: { name: 'Smoke', nit: '900' },
    },
    restaurant: { name: 'Smoke', nit: '900' },
    sale: {},
    payment: {},
  };

  beforeEach(async () => {
    prisma = createPrismaMock();
    billing.issue.mockReset();
    billing.reject.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: prisma },
        { provide: BILLING_PROVIDER, useValue: billing },
      ],
    }).compile();

    service = module.get(InvoicesService);
  });

  function invoiceDelegate() {
    return prisma.invoice as {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  }

  it('print strips the fiscal payload from the POS snapshot', async () => {
    invoiceDelegate().findFirst.mockResolvedValue({
      ...pending,
      responseJson: {
        ...pending.responseJson,
        electronicBilling: { cufe: 'SIM-x' },
      },
    });

    const printed = await service.print('inv-1', 'r1');
    expect(printed).toEqual(pending.responseJson);
    expect(printed).not.toHaveProperty('electronicBilling');
  });

  it('issues via the billing port and stores the provider response', async () => {
    invoiceDelegate().findFirst.mockResolvedValue(pending);
    billing.issue.mockResolvedValue({
      cufe: 'SIM-1',
      payload: { provider: 'restoos-simulator', cufe: 'SIM-1' },
    });
    invoiceDelegate().update.mockResolvedValue({
      ...pending,
      status: InvoiceStatus.ACCEPTED,
      cufe: 'SIM-1',
    });

    await service.markAccepted('inv-1', 'r1');

    expect(billing.issue).toHaveBeenCalledWith(
      expect.objectContaining({ number: 'INV-1', restaurantNit: '900' }),
    );
    expect(invoiceDelegate().update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: InvoiceStatus.ACCEPTED,
          cufe: 'SIM-1',
          responseJson: expect.objectContaining({
            items: pending.responseJson.items,
            electronicBilling: { provider: 'restoos-simulator', cufe: 'SIM-1' },
          }),
        }),
      }),
    );
  });

  it('rejects a second issue on an already accepted invoice', async () => {
    invoiceDelegate().findFirst.mockResolvedValue({
      ...pending,
      status: InvoiceStatus.ACCEPTED,
    });

    await expect(service.markAccepted('inv-1', 'r1')).rejects.toThrow(
      BadRequestException,
    );
    expect(billing.issue).not.toHaveBeenCalled();
  });

  it('stores a rejection payload without a CUFE', async () => {
    invoiceDelegate().findFirst.mockResolvedValue(pending);
    billing.reject.mockResolvedValue({
      cufe: null,
      payload: { action: 'reject', reason: 'datos' },
    });
    invoiceDelegate().update.mockResolvedValue({
      ...pending,
      status: InvoiceStatus.REJECTED,
    });

    await service.markRejected('inv-1', 'r1', 'datos');

    expect(billing.reject).toHaveBeenCalledWith(
      expect.objectContaining({ number: 'INV-1' }),
      'datos',
    );
    expect(invoiceDelegate().update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: InvoiceStatus.REJECTED,
          cufe: null,
        }),
      }),
    );
  });

  it('throws NotFound when the invoice is not in the tenant', async () => {
    invoiceDelegate().findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', 'r1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
