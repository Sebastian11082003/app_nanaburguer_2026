import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OrderStatus, OrderType } from '@prisma/client';

import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemDto } from './dto/add-item.dto';
import { TransferTableDto } from './dto/transfer-table.dto';
import { FindOrdersDto } from './dto/find-orders.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ================================
  // HELPERS
  // ================================
  private validateOrderBusinessRules(dto: CreateOrderDto): void {
    if (dto.type === OrderType.DINE_IN && !dto.tableId) {
      throw new BadRequestException('tableId required for DINE_IN');
    }
  }

  private calculateTotals(items: { lineTotalCents: number }[]) {
    const subtotal = items.reduce((acc, i) => acc + i.lineTotalCents, 0);

    return {
      subtotalCents: subtotal,
      taxCents: 0, // opcional: puedes eliminarlo del schema luego
      totalCents: subtotal,
    };
  }

  // ================================
  // CREATE ORDER (VACÍA)
  // ================================
  async create(dto: CreateOrderDto, restaurantId: string, userId: string) {
    this.validateOrderBusinessRules(dto);

    return this.prisma.$transaction(async (tx) => {
      // 1. VALIDAR MESA
      if (dto.tableId) {
        const table = await tx.tableEntity.findFirst({
          where: { id: dto.tableId, restaurantId },
        });

        if (!table) throw new NotFoundException('Table not found');
        if (!table.isActive) throw new BadRequestException('Table not active');
      }

      // 2. EVITAR DUPLICADOS
      if (dto.tableId) {
        const existingOrder = await tx.order.findFirst({
          where: {
            tableId: dto.tableId,
            restaurantId,
            status: { not: OrderStatus.CLOSED },
          },
          include: { items: true },
        });

        if (existingOrder) return existingOrder;
      }

      // 3. GENERAR NÚMERO
      const lastOrder = await tx.order.findFirst({
        where: { restaurantId },
        orderBy: { orderNumber: 'desc' },
      });

      const nextOrderNumber = (lastOrder?.orderNumber ?? 0) + 1;

      // 4. CREAR ORDEN
      return tx.order.create({
        data: {
          type: dto.type,
          status: OrderStatus.CREATED,
          source: dto.source,

          orderNumber: nextOrderNumber,

          restaurant: {
            connect: { id: restaurantId },
          },

          table: dto.tableId ? { connect: { id: dto.tableId } } : undefined,

          createdBy: {
            connect: { id: userId },
          },
          updatedBy: {
            connect: { id: userId },
          },

          subtotalCents: 0,
          taxCents: 0,
          totalCents: 0,
        },
        include: {
          items: true,
          table: true,
        },
      });
    });
  }

  // ================================
  // ADD ITEM
  // ================================
  async addItem(orderId: string, dto: AddItemDto, restaurantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, restaurantId },
      });

      if (!order) throw new NotFoundException('Order not found');
      if (order.status === OrderStatus.CLOSED)
        throw new BadRequestException('Order closed');

      const menuItem = await tx.menuItem.findFirst({
        where: { id: dto.menuItemId, restaurantId },
      });

      if (!menuItem) throw new NotFoundException('Menu item not found');
      if (!menuItem.isAvailable)
        throw new BadRequestException('Item not available');

      await tx.orderItem.create({
        data: {
          order: { connect: { id: orderId } },
          menuItem: { connect: { id: menuItem.id } },
          quantity: dto.quantity,
          unitPriceCents: menuItem.priceCents,
          lineTotalCents: menuItem.priceCents * dto.quantity,
          notes: dto.notes,
        },
      });

      const items = await tx.orderItem.findMany({
        where: { orderId },
      });

      const totals = this.calculateTotals(items);

      return tx.order.update({
        where: { id: orderId },
        data: totals,
        include: { items: true },
      });
    });
  }

  // ================================
  // UPDATE STATUS
  // ================================
  async updateStatus(
    orderId: string,
    status: OrderStatus,
    restaurantId: string,
    userId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });

    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedBy: { connect: { id: userId } },
      },
    });
  }

  // ================================
  // TRANSFER TABLE
  // ================================
  async transferTable(
    orderId: string,
    dto: TransferTableDto,
    restaurantId: string,
  ) {
    const table = await this.prisma.tableEntity.findFirst({
      where: { id: dto.newTableId, restaurantId },
    });

    if (!table) throw new NotFoundException('Table not found');
    if (!table.isActive) throw new BadRequestException('Table not active');

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        table: { connect: { id: dto.newTableId } },
      },
    });
  }

  // ================================
  // CLOSE ORDER
  // ================================
  async closeOrder(orderId: string, restaurantId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, restaurantId },
        include: { sale: true },
      });

      if (!order) throw new NotFoundException('Order not found');

      if (order.status === OrderStatus.CLOSED) {
        throw new BadRequestException('Already closed');
      }

      // 🔥 SOLO cerrar (NO tocar dinero)
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CLOSED,
          closedAt: new Date(),
          updatedBy: { connect: { id: userId } },
        },
      });

      // 🔥 Crear SALE (solo consumo)
      if (!order.sale) {
        await tx.sale.create({
          data: {
            order: { connect: { id: orderId } },
            restaurant: { connect: { id: restaurantId } },
            totalCents: order.totalCents,
          },
        });
      }

      return updated;
    });
  }

  // ================================
  // FIND
  // ================================
  async findAll(restaurantId: string, query: FindOrdersDto) {
    return this.prisma.order.findMany({
      where: {
        restaurantId,
        ...(query.status && { status: query.status }),
        ...(query.type && { type: query.type }),
        ...(query.tableId && { tableId: query.tableId }),
      },
      include: {
        items: true,
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, restaurantId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, restaurantId },
      include: {
        items: true,
        table: true,
        sale: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }
}
