import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

import { OrderStatus, OrderType, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ================================
  // BUSINESS RULES
  // ================================
  private validateOrderBusinessRules(dto: CreateOrderDto): void {
    if (dto.type === OrderType.DINE_IN && !dto.tableId) {
      throw new BadRequestException('tableId required for DINE_IN');
    }

    if (dto.type === OrderType.DELIVERY) {
      if (!dto.customerName || !dto.customerPhone || !dto.deliveryAddress) {
        throw new BadRequestException('Missing delivery data');
      }
    }

    if (dto.type === OrderType.PICKUP && !dto.customerName) {
      throw new BadRequestException('customerName required for PICKUP');
    }
  }

  // ================================
  // STATUS FLOW
  // ================================
  private getAllowedNextStatuses(status: OrderStatus): OrderStatus[] {
    const map: Record<OrderStatus, OrderStatus[]> = {
      CREATED: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELED],
      IN_PREPARATION: [OrderStatus.READY, OrderStatus.CANCELED],
      READY: [OrderStatus.DELIVERED, OrderStatus.CLOSED],
      DELIVERED: [OrderStatus.CLOSED],
      CLOSED: [],
      CANCELED: [],
      SENT_TO_KITCHEN: [OrderStatus.IN_PREPARATION],
    };

    return map[status] ?? [];
  }

  // ================================
  // CREATE ORDER
  // ================================
  async create(dto: CreateOrderDto, restaurantId: string, userId: string) {
    this.validateOrderBusinessRules(dto);

    // validar mesa (tenant-safe)
    if (dto.tableId) {
      const table = await this.prisma.tableEntity.findFirst({
        where: {
          id: dto.tableId,
          restaurantId,
        },
      });

      if (!table) throw new NotFoundException('Table not found');
      if (!table.isActive) throw new BadRequestException('Table not active');
    }

    // traer menu items
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: dto.items.map((i) => i.menuItemId) },
        restaurantId,
      },
    });

    if (menuItems.length !== dto.items.length) {
      throw new NotFoundException('Menu items mismatch');
    }

    const map = new Map(menuItems.map((m) => [m.id, m]));

    const itemsData = dto.items.map((i) => {
      const m = map.get(i.menuItemId);

      if (!m) throw new NotFoundException('Menu item not found');
      if (!m.isAvailable)
        throw new BadRequestException(`Item ${m.name} not available`);

      return {
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        unitPriceCents: m.priceCents,
        lineTotalCents: m.priceCents * i.quantity,
        notes: i.notes,
      };
    });

    const subtotal = itemsData.reduce((a, i) => a + i.lineTotalCents, 0);
    const tax = Math.floor(subtotal * 0.19);
    const total = subtotal + tax;

    return this.prisma.order.create({
      data: {
        type: dto.type,
        status: OrderStatus.CREATED,
        tableId: dto.tableId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        deliveryAddress: dto.deliveryAddress,
        subtotalCents: subtotal,
        taxCents: tax,
        totalCents: total,
        restaurantId,
        createdById: userId,
        updatedById: userId,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
      },
    });
  }

  // ================================
  // FIND ALL
  // ================================
  async findAll(restaurantId: string) {
    return this.prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ================================
  // FIND ONE
  // ================================
  async findOne(id: string, restaurantId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, restaurantId },
      include: {
        items: true,
        sale: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  // ================================
  // UPDATE STATUS
  // ================================
  async updateStatus(
    id: string,
    newStatus: OrderStatus,
    restaurantId: string,
    userId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id, restaurantId },
      include: {
        sale: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.status === newStatus) {
      throw new BadRequestException('Same status');
    }

    const allowed = this.getAllowedNextStatuses(order.status);

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition ${order.status} → ${newStatus}`,
      );
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: newStatus,
          updatedById: userId,
          ...(newStatus === OrderStatus.CLOSED && {
            closedAt: new Date(),
          }),
        },
      });

      // 🔥 CREATE SALE WHEN CLOSED
      if (newStatus === OrderStatus.CLOSED) {
        if (!order.sale) {
          await tx.sale.create({
            data: {
              orderId: order.id,
              restaurantId,
              totalCents: order.totalCents,
            },
          });
        }
      }

      return updated;
    });
  }
}
