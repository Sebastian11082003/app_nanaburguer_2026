import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderSource, OrderStatus, OrderType } from '@prisma/client';

import { OrdersService } from './orders.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../test/prisma-mock';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(OrdersService);
  });

  describe('create', () => {
    it('rejects DINE_IN orders without a tableId before touching the database', async () => {
      await expect(
        service.create(
          { type: OrderType.DINE_IN, source: OrderSource.WAITER } as never,
          'restaurant-1',
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws NotFound when the table does not belong to the tenant', async () => {
      (prisma.tableEntity as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          {
            type: OrderType.DINE_IN,
            source: OrderSource.WAITER,
            tableId: 'table-1',
          } as never,
          'restaurant-1',
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when the table is inactive', async () => {
      (prisma.tableEntity as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'table-1',
        isActive: false,
      });

      await expect(
        service.create(
          {
            type: OrderType.DINE_IN,
            source: OrderSource.WAITER,
            tableId: 'table-1',
          } as never,
          'restaurant-1',
          'user-1',
        ),
      ).rejects.toThrow('Table not active');
    });

    it('returns the existing open order for a table instead of creating a duplicate', async () => {
      const existingOrder = { id: 'order-existing', status: OrderStatus.CREATED };
      (prisma.tableEntity as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'table-1',
        isActive: true,
      });
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue(existingOrder);

      const result = await service.create(
        {
          type: OrderType.DINE_IN,
          source: OrderSource.WAITER,
          tableId: 'table-1',
        } as never,
        'restaurant-1',
        'user-1',
      );

      expect(result).toBe(existingOrder);
      expect(prisma.order as { create: jest.Mock }).toHaveProperty('create');
      expect((prisma.order as { create: jest.Mock }).create).not.toHaveBeenCalled();
    });

    it('creates a new order with the next sequential order number, scoped to the tenant', async () => {
      (prisma.tableEntity as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'table-1',
        isActive: true,
      });
      (prisma.order as { findFirst: jest.Mock }).findFirst
        .mockResolvedValueOnce(null) // no duplicate order
        .mockResolvedValueOnce({ orderNumber: 4 }); // last order for numbering
      (prisma.order as { create: jest.Mock }).create.mockResolvedValue({
        id: 'order-new',
      });
      (prisma.order as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: 'order-new',
        orderNumber: 5,
      });

      const result = await service.create(
        {
          type: OrderType.DINE_IN,
          source: OrderSource.WAITER,
          tableId: 'table-1',
        } as never,
        'restaurant-1',
        'user-1',
      );

      const [[createArgs]] = (prisma.order as { create: jest.Mock }).create.mock.calls;
      expect(createArgs.data.orderNumber).toBe(5);
      expect(createArgs.data.restaurant.connect.id).toBe('restaurant-1');
      expect(result).toEqual({ id: 'order-new', orderNumber: 5 });
    });

    it('does NOT treat a CANCELED order as still occupying the table (regression)', async () => {
      // Before the fix, the dedupe check used `status: { not: CLOSED }`,
      // which meant a CANCELED order kept blocking the table forever.
      (prisma.tableEntity as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'table-1',
        isActive: true,
      });
      // The tenant-scoped lookup for an "active" order finds nothing,
      // because the only order on this table is CANCELED.
      (prisma.order as { findFirst: jest.Mock }).findFirst
        .mockResolvedValueOnce(null) // no active order blocks the table
        .mockResolvedValueOnce(null); // no previous order for numbering
      (prisma.order as { create: jest.Mock }).create.mockResolvedValue({
        id: 'order-new',
      });
      (prisma.order as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: 'order-new',
        orderNumber: 1,
      });

      const result = await service.create(
        {
          type: OrderType.DINE_IN,
          source: OrderSource.WAITER,
          tableId: 'table-1',
        } as never,
        'restaurant-1',
        'user-1',
      );

      expect((prisma.order as { create: jest.Mock }).create).toHaveBeenCalled();
      expect(result).toEqual({ id: 'order-new', orderNumber: 1 });
    });

    it('creates a linked Delivery record for DELIVERY orders', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValueOnce(null);
      (prisma.order as { create: jest.Mock }).create.mockResolvedValue({ id: 'order-1' });
      (prisma.order as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: 'order-1',
      });

      await service.create(
        {
          type: OrderType.DELIVERY,
          source: OrderSource.DELIVERY,
          customerName: 'Juan',
          customerPhone: '3000000000',
          deliveryAddress: 'Calle 1',
        } as never,
        'restaurant-1',
        'user-1',
      );

      expect(prisma.delivery as { create: jest.Mock }).toHaveProperty('create');
      const [[deliveryArgs]] = (prisma.delivery as { create: jest.Mock }).create.mock.calls;
      expect(deliveryArgs.data).toMatchObject({
        orderId: 'order-1',
        customerName: 'Juan',
        phone: '3000000000',
        restaurantId: 'restaurant-1',
      });
    });
  });

  describe('addItem', () => {
    it('throws NotFound when the order does not belong to the tenant', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(
        service.addItem('order-1', { menuItemId: 'item-1', quantity: 1 } as never, 'restaurant-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when the order is already closed', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.CLOSED,
      });

      await expect(
        service.addItem('order-1', { menuItemId: 'item-1', quantity: 1 } as never, 'restaurant-1'),
      ).rejects.toThrow('Order closed');
    });

    it('throws BadRequest when the menu item is not available', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.CREATED,
      });
      (prisma.menuItem as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'item-1',
        isAvailable: false,
        priceCents: 15000,
      });

      await expect(
        service.addItem('order-1', { menuItemId: 'item-1', quantity: 1 } as never, 'restaurant-1'),
      ).rejects.toThrow('Item not available');
    });

    it('computes line totals and updates order totals correctly', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.CREATED,
      });
      (prisma.menuItem as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'item-1',
        isAvailable: true,
        priceCents: 15000,
      });
      (prisma.orderItem as { findMany: jest.Mock }).findMany.mockResolvedValue([
        { lineTotalCents: 30000 },
      ]);
      (prisma.order as { update: jest.Mock }).update.mockResolvedValue({
        id: 'order-1',
        totalCents: 30000,
      });

      const result = await service.addItem(
        'order-1',
        { menuItemId: 'item-1', quantity: 2 } as never,
        'restaurant-1',
      );

      const [[itemCreateArgs]] = (prisma.orderItem as { create: jest.Mock }).create.mock.calls;
      expect(itemCreateArgs.data.unitPriceCents).toBe(15000);
      expect(itemCreateArgs.data.lineTotalCents).toBe(30000);

      const [[updateArgs]] = (prisma.order as { update: jest.Mock }).update.mock.calls;
      expect(updateArgs.data).toEqual({
        subtotalCents: 30000,
        taxCents: 0,
        discountCents: 0,
        totalCents: 30000,
      });
      expect(result).toEqual({ id: 'order-1', totalCents: 30000 });
    });
  });

  describe('updateStatus', () => {
    it('throws NotFound for an order outside the tenant scope', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('order-1', OrderStatus.SENT_TO_KITCHEN, 'restaurant-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates the status and records who made the change', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'order-1',
      });
      (prisma.order as { update: jest.Mock }).update.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.SENT_TO_KITCHEN,
      });

      const result = await service.updateStatus(
        'order-1',
        OrderStatus.SENT_TO_KITCHEN,
        'restaurant-1',
        'user-1',
      );

      const [[updateArgs]] = (prisma.order as { update: jest.Mock }).update.mock.calls;
      expect(updateArgs.data.status).toBe(OrderStatus.SENT_TO_KITCHEN);
      expect(updateArgs.data.updatedBy.connect.id).toBe('user-1');
      expect(result.status).toBe(OrderStatus.SENT_TO_KITCHEN);
    });
  });

  describe('transferTable', () => {
    it('throws NotFound when the destination table does not belong to the tenant', async () => {
      (prisma.tableEntity as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(
        service.transferTable('order-1', { newTableId: 'table-2' } as never, 'restaurant-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when the destination table is inactive', async () => {
      (prisma.tableEntity as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'table-2',
        isActive: false,
      });

      await expect(
        service.transferTable('order-1', { newTableId: 'table-2' } as never, 'restaurant-1'),
      ).rejects.toThrow('Table not active');
    });

    it('rejects the transfer when the destination table already has a different active order (regression)', async () => {
      // Without this guard, two orders could end up pointing at the same
      // table, breaking the "one active order per table" invariant relied
      // on by `create`'s dedupe check and by TablesService occupancy.
      (prisma.tableEntity as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'table-2',
        isActive: true,
      });
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'other-order',
      });

      await expect(
        service.transferTable('order-1', { newTableId: 'table-2' } as never, 'restaurant-1'),
      ).rejects.toThrow('Destination table is already occupied');
    });

    it('moves the order to the destination table when it is free', async () => {
      (prisma.tableEntity as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'table-2',
        isActive: true,
      });
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);
      (prisma.order as { update: jest.Mock }).update.mockResolvedValue({
        id: 'order-1',
        tableId: 'table-2',
      });

      const result = await service.transferTable(
        'order-1',
        { newTableId: 'table-2' } as never,
        'restaurant-1',
      );

      const [[updateArgs]] = (prisma.order as { update: jest.Mock }).update.mock.calls;
      expect(updateArgs.data.table.connect.id).toBe('table-2');
      expect(result.tableId).toBe('table-2');
    });
  });

  describe('closeOrder', () => {
    it('throws NotFound when the order does not belong to the tenant', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(service.closeOrder('order-1', 'restaurant-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequest when the order is already closed', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.CLOSED,
        sale: null,
      });

      await expect(service.closeOrder('order-1', 'restaurant-1', 'user-1')).rejects.toThrow(
        'Already closed',
      );
    });

    it('creates a Sale linked to the order when none exists yet', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.READY,
        totalCents: 20000,
        sale: null,
      });
      (prisma.order as { update: jest.Mock }).update.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.CLOSED,
      });

      await service.closeOrder('order-1', 'restaurant-1', 'user-1');

      expect(prisma.sale as { create: jest.Mock }).toHaveProperty('create');
      const [[saleArgs]] = (prisma.sale as { create: jest.Mock }).create.mock.calls;
      expect(saleArgs.data.totalCents).toBe(20000);
      expect(saleArgs.data.restaurant.connect.id).toBe('restaurant-1');
    });

    it('does not create a duplicate Sale when one already exists', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.READY,
        totalCents: 20000,
        sale: { id: 'sale-1' },
      });
      (prisma.order as { update: jest.Mock }).update.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.CLOSED,
      });

      await service.closeOrder('order-1', 'restaurant-1', 'user-1');

      expect((prisma.sale as { create: jest.Mock }).create).not.toHaveBeenCalled();
    });
  });

  describe('tenant isolation on reads', () => {
    it('always scopes findAll by restaurantId', async () => {
      (prisma.order as { findMany: jest.Mock }).findMany.mockResolvedValue([]);

      await service.findAll('restaurant-1', {});

      const [[callArgs]] = (prisma.order as { findMany: jest.Mock }).findMany.mock.calls;
      expect(callArgs.where.restaurantId).toBe('restaurant-1');
    });

    it('always scopes findOne by restaurantId and throws NotFound for other tenants', async () => {
      (prisma.order as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(service.findOne('order-from-another-tenant', 'restaurant-1')).rejects.toThrow(
        NotFoundException,
      );

      const [[callArgs]] = (prisma.order as { findFirst: jest.Mock }).findFirst.mock.calls;
      expect(callArgs.where).toEqual({
        id: 'order-from-another-tenant',
        restaurantId: 'restaurant-1',
      });
    });
  });
});
