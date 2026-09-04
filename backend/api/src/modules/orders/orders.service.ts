import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { OrderStatus, OrderType, PaymentMethod } from '@prisma/client';

import { ACTIVE_ORDER_STATUSES } from '../../common/constants/order-status.constants';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemDto } from './dto/add-item.dto';
import { TransferTableDto } from './dto/transfer-table.dto';
import { FindOrdersDto } from './dto/find-orders.dto';

/**
 * OrdersService is the core of the operational flow: creating orders,
 * adding items, moving them through the kitchen lifecycle, transferring
 * tables and finally closing them (which spins off a Sale).
 *
 * It intentionally does NOT touch payments/invoicing directly — closing an
 * order only creates the `Sale` record; PaymentsService takes it from there.
 */
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Canonical Prisma `include` for every Order returned to the client.
   * Single source of truth so all endpoints stay consistent — in
   * particular:
   *   - `items.menuItem.name` is what lets the UI print an actual kitchen
   *     ticket ("comanda") instead of a generic "1x item" line.
   *   - `createdBy`/`updatedBy` (name + role only, never the password
   *     hash) is what lets Órdenes work as a paper trail: which waiter
   *     opened the order, which cashier closed/invoiced it.
   */
  private static readonly ORDER_INCLUDE = {
    items: { include: { menuItem: { select: { name: true } } } },
    table: true,
    delivery: true,
    sale: true,
    createdBy: { select: { id: true, fullName: true, role: true } },
    updatedBy: { select: { id: true, fullName: true, role: true } },
  } as const;

  // ================================
  // HELPERS
  // ================================

  /**
   * DTO-level business rule that must hold true regardless of tenant/DB
   * state, so it's checked before opening a transaction: a dine-in order
   * without a table doesn't make sense.
   */
  private validateOrderBusinessRules(dto: CreateOrderDto): void {
    if (dto.type === OrderType.DINE_IN && !dto.tableId) {
      throw new BadRequestException('tableId required for DINE_IN');
    }
  }

  /**
   * Recomputes order-level totals from its current line items.
   * Tax is a flat 0 for now (no tax engine yet) — kept as an explicit
   * field so it's a one-line change when that's implemented.
   */
  private calculateTotals(
    items: { lineTotalCents: number }[],
    discountCents = 0,
  ) {
    const subtotal = items.reduce((acc, i) => acc + i.lineTotalCents, 0);
    const discount = Math.min(Math.max(discountCents, 0), subtotal);

    return {
      subtotalCents: subtotal,
      taxCents: 0,
      discountCents: discount,
      totalCents: subtotal - discount,
    };
  }

  // ================================
  // CREATE ORDER
  // ================================
  /**
   * Creates a new order (DINE_IN, DELIVERY or PICKUP).
   *
   * For DINE_IN this doubles as "assign an order to a table": if the table
   * already has an active order, that SAME order is returned instead of
   * creating a duplicate — this is what lets a waiter tap a table twice
   * (e.g. to add more items) without accidentally opening two tickets.
   */
  async create(dto: CreateOrderDto, restaurantId: string, userId: string) {
    this.validateOrderBusinessRules(dto);

    return this.prisma.$transaction(async (tx) => {
      // 1. VALIDAR MESA: must belong to this tenant and be active.
      if (dto.tableId) {
        const table = await tx.tableEntity.findFirst({
          where: {
            id: dto.tableId,
            restaurantId,
          },
        });

        if (!table) {
          throw new NotFoundException('Table not found');
        }

        if (!table.isActive) {
          throw new BadRequestException('Table not active');
        }
      }

      // 2. EVITAR DUPLICADOS: reuse the table's current order if it still
      // has one "in play". Only CREATED/SENT_TO_KITCHEN/IN_PREPARATION/
      // READY/OUT_FOR_DELIVERY count — CLOSED and CANCELED orders must
      // NOT block a table from taking a fresh order (that was a real bug:
      // a canceled order used to keep the table stuck forever).
      if (dto.tableId) {
        const existingOrder = await tx.order.findFirst({
          where: {
            tableId: dto.tableId,
            restaurantId,
            status: {
              in: ACTIVE_ORDER_STATUSES,
            },
          },

          include: OrdersService.ORDER_INCLUDE,
        });

        if (existingOrder) {
          return existingOrder;
        }
      }

      // 3. GENERAR NÚMERO
      const lastOrder = await tx.order.findFirst({
        where: { restaurantId },

        orderBy: {
          orderNumber: 'desc',
        },
      });

      const nextOrderNumber = (lastOrder?.orderNumber ?? 0) + 1;

      // 4. CREAR ORDEN
      const order = await tx.order.create({
        data: {
          orderNumber: nextOrderNumber,

          type: dto.type,
          source: dto.source,

          status: OrderStatus.CREATED,

          restaurant: {
            connect: {
              id: restaurantId,
            },
          },

          table: dto.tableId
            ? {
                connect: {
                  id: dto.tableId,
                },
              }
            : undefined,

          createdBy: {
            connect: {
              id: userId,
            },
          },

          updatedBy: {
            connect: {
              id: userId,
            },
          },

          subtotalCents: 0,
          taxCents: 0,
          totalCents: 0,
        },

        include: OrdersService.ORDER_INCLUDE,
      });

      // 5. CREAR DELIVERY / PICKUP
      // Pickup also gets a Delivery row so the delivery station can
      // list it on /deliveries/active (that API reads Delivery, not Order).
      if (
        dto.type === OrderType.DELIVERY ||
        dto.type === OrderType.PICKUP
      ) {
        await tx.delivery.create({
          data: {
            orderId: order.id,

            customerName: dto.customerName ?? 'Pickup',
            phone: dto.customerPhone || 's/n',
            address: dto.deliveryAddress,
            neighborhood: dto.neighborhood,

            paymentMethod: dto.paymentMethod as PaymentMethod,

            restaurantId,

            deliveryUserId: userId,
          },
        });
      }

      // 6. RETORNAR COMPLETA
      return tx.order.findUnique({
        where: {
          id: order.id,
        },

        include: OrdersService.ORDER_INCLUDE,
      });
    });
  }

  // ================================
  // ADD ITEM
  // ================================
  /**
   * Appends one line item to an open order and recomputes its totals.
   * Rejects items that don't belong to this tenant, aren't available on
   * the menu, or belong to an order that's already CLOSED.
   */
  async addItem(orderId: string, dto: AddItemDto, restaurantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          restaurantId,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.CLOSED) {
        throw new BadRequestException('Order closed');
      }

      const menuItem = await tx.menuItem.findFirst({
        where: {
          id: dto.menuItemId,
          restaurantId,
        },
      });

      if (!menuItem) {
        throw new NotFoundException('Menu item not found');
      }

      if (!menuItem.isAvailable) {
        throw new BadRequestException('Item not available');
      }

      await tx.orderItem.create({
        data: {
          order: {
            connect: {
              id: orderId,
            },
          },

          menuItem: {
            connect: {
              id: menuItem.id,
            },
          },

          quantity: dto.quantity,

          unitPriceCents: menuItem.priceCents,

          lineTotalCents: menuItem.priceCents * dto.quantity,

          notes: dto.notes,
        },
      });

      const items = await tx.orderItem.findMany({
        where: { orderId },
      });

      const totals = this.calculateTotals(items, order.discountCents);

      return tx.order.update({
        where: {
          id: orderId,
        },

        data: totals,

        include: OrdersService.ORDER_INCLUDE,
      });
    });
  }

  // ================================
  // UPDATE ITEM
  // ================================
  /**
   * Edits a line item. Quantity/notes only while CREATED; cortesía
   * (`isComplimentary`) allowed until the order is closed/canceled.
   */
  async updateItem(
    orderId: string,
    itemId: string,
    dto: { quantity?: number; notes?: string; isComplimentary?: boolean },
    restaurantId: string,
  ) {
    if (
      dto.quantity === undefined &&
      dto.notes === undefined &&
      dto.isComplimentary === undefined
    ) {
      throw new BadRequestException('Nothing to update');
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, restaurantId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (
        order.status === OrderStatus.CLOSED ||
        order.status === OrderStatus.CANCELED
      ) {
        throw new BadRequestException('Order is closed or canceled');
      }

      const editingQtyOrNotes =
        dto.quantity !== undefined || dto.notes !== undefined;
      if (editingQtyOrNotes && order.status !== OrderStatus.CREATED) {
        throw new BadRequestException(
          'Quantity/notes can only be edited before the order is sent to kitchen',
        );
      }

      const item = await tx.orderItem.findFirst({
        where: { id: itemId, orderId },
      });

      if (!item) {
        throw new NotFoundException('Order item not found');
      }

      const quantity = dto.quantity ?? item.quantity;
      const notes =
        dto.notes !== undefined ? dto.notes.trim() || null : item.notes;
      const isComplimentary = dto.isComplimentary ?? item.isComplimentary;
      const lineTotalCents = isComplimentary
        ? 0
        : item.unitPriceCents * quantity;

      await tx.orderItem.update({
        where: { id: itemId },
        data: {
          quantity,
          notes,
          isComplimentary,
          lineTotalCents,
        },
      });

      const items = await tx.orderItem.findMany({ where: { orderId } });
      const totals = this.calculateTotals(items, order.discountCents);

      return tx.order.update({
        where: { id: orderId },
        data: totals,
        include: OrdersService.ORDER_INCLUDE,
      });
    });
  }

  // ================================
  // SET DISCOUNT
  // ================================
  /** Applies an order-level discount in cents (capped at subtotal). */
  async setDiscount(
    orderId: string,
    discountCents: number,
    restaurantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, restaurantId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (
        order.status === OrderStatus.CLOSED ||
        order.status === OrderStatus.CANCELED
      ) {
        throw new BadRequestException('Order is closed or canceled');
      }

      const items = await tx.orderItem.findMany({ where: { orderId } });
      const totals = this.calculateTotals(items, discountCents);

      return tx.order.update({
        where: { id: orderId },
        data: totals,
        include: OrdersService.ORDER_INCLUDE,
      });
    });
  }

  // ================================
  // REMOVE ITEM
  // ================================
  /**
   * Removes a line item while the order is still being built (status
   * CREATED, i.e. never sent to kitchen). This is a hard delete — safe
   * only at this stage because nothing downstream (kitchen ticket, sales
   * report) has seen the item yet. Once the order leaves CREATED, use
   * the future per-item "cancel" flow instead (keeps an audit trail),
   * not this one.
   */
  async removeItem(
    orderId: string,
    itemId: string,
    restaurantId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, restaurantId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatus.CREATED) {
        throw new BadRequestException(
          'Items can only be removed before the order is sent to kitchen',
        );
      }

      const item = await tx.orderItem.findFirst({
        where: { id: itemId, orderId },
      });

      if (!item) {
        throw new NotFoundException('Order item not found');
      }

      await tx.orderItem.delete({ where: { id: itemId } });

      const items = await tx.orderItem.findMany({ where: { orderId } });
      const totals = this.calculateTotals(items, order.discountCents);

      return tx.order.update({
        where: { id: orderId },
        data: totals,
        include: OrdersService.ORDER_INCLUDE,
      });
    });
  }

  // ================================
  // UPDATE STATUS
  // ================================
  /**
   * Moves an order to a new lifecycle status (e.g. SENT_TO_KITCHEN →
   * IN_PREPARATION → READY). Who is allowed to call this per status is
   * enforced at the controller level via `@Roles`, not here — this method
   * only guarantees the order exists and belongs to the tenant.
   */
  async updateStatus(
    orderId: string,
    status: OrderStatus,
    restaurantId: string,
    userId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status,

        updatedBy: {
          connect: {
            id: userId,
          },
        },
      },

      include: OrdersService.ORDER_INCLUDE,
    });
  }

  // ================================
  // TRANSFER TABLE
  // ================================
  /**
   * Moves an existing order from its current table to a different one
   * (e.g. the host reseats a customer). The destination table must:
   *   1. belong to this tenant and be active, and
   *   2. NOT already have a different active order on it.
   *
   * Without check (2), two open orders could end up pointing at the same
   * table at once, which breaks every place that assumes "at most one
   * active order per table" (dedupe in `create`, occupancy in
   * `TablesService`, etc).
   */
  async transferTable(
    orderId: string,
    dto: TransferTableDto,
    restaurantId: string,
  ) {
    const table = await this.prisma.tableEntity.findFirst({
      where: {
        id: dto.newTableId,
        restaurantId,
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    if (!table.isActive) {
      throw new BadRequestException('Table not active');
    }

    const conflictingOrder = await this.prisma.order.findFirst({
      where: {
        tableId: dto.newTableId,
        restaurantId,
        status: { in: ACTIVE_ORDER_STATUSES },
        id: { not: orderId },
      },
    });

    if (conflictingOrder) {
      throw new BadRequestException('Destination table is already occupied');
    }

    return this.prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        table: {
          connect: {
            id: dto.newTableId,
          },
        },
      },

      include: OrdersService.ORDER_INCLUDE,
    });
  }

  // ================================
  // CLOSE ORDER
  // ================================
  /**
   * Closes an order (freeing its table) and creates the linked `Sale`
   * record used for payments/invoicing. Idempotent with respect to Sale
   * creation: if a Sale already exists for this order it's left alone,
   * so retrying a close request never produces duplicate sales.
   */
  async closeOrder(orderId: string, restaurantId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          restaurantId,
        },

        include: {
          sale: true,
          delivery: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.CLOSED) {
        throw new BadRequestException('Already closed');
      }

      // CERRAR ORDEN
      const updated = await tx.order.update({
        where: {
          id: orderId,
        },

        data: {
          status: OrderStatus.CLOSED,
          closedAt: new Date(),

          updatedBy: {
            connect: {
              id: userId,
            },
          },
        },

        include: OrdersService.ORDER_INCLUDE,
      });

      // CREAR SALE
      if (!order.sale) {
        await tx.sale.create({
          data: {
            order: {
              connect: {
                id: orderId,
              },
            },

            restaurant: {
              connect: {
                id: restaurantId,
              },
            },

            totalCents: order.totalCents,
          },
        });
      }

      return updated;
    });
  }

  // ================================
  // FIND ALL
  // ================================
  /**
   * Lists orders for the tenant, optionally filtered by status/type/table.
   * `restaurantId` is always the first `where` clause — never build a
   * variant of this query without it, or you'd leak orders across tenants.
   */
  async findAll(restaurantId: string, query: FindOrdersDto) {
    return this.prisma.order.findMany({
      where: {
        restaurantId,

        ...(query.status && {
          status: query.status,
        }),

        ...(query.type && {
          type: query.type,
        }),

        ...(query.tableId && {
          tableId: query.tableId,
        }),
      },

      include: OrdersService.ORDER_INCLUDE,

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ================================
  // FIND ONE
  // ================================
  /** Fetches a single order, scoped to the tenant. 404s otherwise (never leaks existence). */
  async findOne(id: string, restaurantId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        restaurantId,
      },

      include: OrdersService.ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
