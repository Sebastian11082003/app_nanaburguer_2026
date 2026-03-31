import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, OrderType, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersDto } from './dto/find-orders.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private validateOrderBusinessRules(dto: CreateOrderDto): void {
    if (dto.type === OrderType.DINE_IN && !dto.tableId) {
      throw new BadRequestException('tableId is required for DINE_IN orders');
    }

    if (dto.type === OrderType.DELIVERY) {
      if (!dto.customerName || !dto.customerPhone || !dto.deliveryAddress) {
        throw new BadRequestException(
          'customerName, customerPhone and deliveryAddress are required for DELIVERY orders',
        );
      }
    }

    if (dto.type === OrderType.PICKUP) {
      if (!dto.customerName) {
        throw new BadRequestException(
          'customerName is required for PICKUP orders',
        );
      }
    }
  }

  async create(dto: CreateOrderDto, currentUserId: string) {
    this.validateOrderBusinessRules(dto);

    if (dto.tableId) {
      const table = await this.prisma.tableEntity.findUnique({
        where: { id: dto.tableId },
      });

      if (!table) {
        throw new NotFoundException('Table not found');
      }

      if (!table.isActive) {
        throw new BadRequestException('Table is not active');
      }
    }

    const menuItemIds = dto.items.map((item) => item.menuItemId);

    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
      },
      select: {
        id: true,
        name: true,
        priceCents: true,
        isAvailable: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new NotFoundException('One or more menu items were not found');
    }

    const menuItemsMap = new Map(menuItems.map((item) => [item.id, item]));

    const orderItemsData = dto.items.map((item) => {
      const menuItem = menuItemsMap.get(item.menuItemId);

      if (!menuItem) {
        throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      }

      if (!menuItem.isAvailable) {
        throw new BadRequestException(
          `Menu item "${menuItem.name}" is not available`,
        );
      }

      const unitPriceCents = menuItem.priceCents;
      const lineTotalCents = unitPriceCents * item.quantity;

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents,
        notes: item.notes,
      };
    });

    const subtotalCents = orderItemsData.reduce(
      (sum, item) => sum + item.lineTotalCents,
      0,
    );

    const taxCents = 0;
    const totalCents = subtotalCents + taxCents;

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.create({
        data: {
          type: dto.type,
          status: OrderStatus.CREATED,
          tableId: dto.tableId,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          deliveryAddress: dto.deliveryAddress,
          subtotalCents,
          taxCents,
          totalCents,
          createdById: currentUserId,
          updatedById: currentUserId,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          table: true,
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  priceCents: true,
                },
              },
            },
          },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: OrderStatus.CREATED,
          toStatus: OrderStatus.CREATED,
          changedById: currentUserId,
        },
      });

      return order;
    });
  }

  async findAll(filters: FindOrdersDto) {
    return this.prisma.order.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.tableId ? { tableId: filters.tableId } : {}),
        ...(filters.customerPhone
          ? { customerPhone: filters.customerPhone }
          : {}),
      },
      include: {
        table: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                priceCents: true,
              },
            },
          },
        },
        payment: true,
        history: {
          orderBy: {
            changedAt: 'asc',
          },
          include: {
            changedBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                priceCents: true,
              },
            },
          },
        },
        payment: true,
        history: {
          orderBy: {
            changedAt: 'asc',
          },
          include: {
            changedBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
  private getAllowedNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      CREATED: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELED],
      IN_PREPARATION: [OrderStatus.READY, OrderStatus.CANCELED],
      READY: [
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
        OrderStatus.CLOSED,
        OrderStatus.CANCELED,
      ],
      OUT_FOR_DELIVERY: [OrderStatus.DELIVERED, OrderStatus.CANCELED],
      DELIVERED: [OrderStatus.CLOSED],
      CLOSED: [],
      CANCELED: [],
    };

    return transitions[currentStatus] ?? [];
  }

  async updateStatus(
    id: string,
    newStatus: OrderStatus,
    currentUserId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === newStatus) {
      throw new BadRequestException(`Order is already in status ${newStatus}`);
    }

    const allowedNextStatuses = this.getAllowedNextStatuses(order.status);

    if (!allowedNextStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${newStatus}`,
      );
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: newStatus,
          updatedById: currentUserId,
          ...(newStatus === OrderStatus.CLOSED ? { closedAt: new Date() } : {}),
        },
        include: {
          table: true,
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  priceCents: true,
                },
              },
            },
          },
          payment: true,
          history: {
            orderBy: {
              changedAt: 'asc',
            },
            include: {
              changedBy: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: newStatus,
          changedById: currentUserId,
        },
      });

      return updatedOrder;
    });
  }
}
