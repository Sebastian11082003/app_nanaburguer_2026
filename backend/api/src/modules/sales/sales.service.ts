import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Prisma, OrderStatus } from '@prisma/client';

import { FindSalesDto } from './dto/find-sales.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🔥 CREA SALE DESDE ORDEN (SOURCE OF TRUTH)
   */
  async createFromOrder(orderId: string, restaurantId: string, userId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, restaurantId },
        include: { sale: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.sale) {
        throw new BadRequestException('Sale already exists');
      }

      // 🔥 VALIDACIÓN REAL DE NEGOCIO
      if (
        order.status !== OrderStatus.READY &&
        order.status !== OrderStatus.DELIVERED
      ) {
        throw new BadRequestException(
          'Order must be READY or DELIVERED to be charged',
        );
      }

      // 🔥 Crear sale
      const sale = await tx.sale.create({
        data: {
          orderId: order.id,
          restaurantId,
          totalCents: order.totalCents,
        },
      });

      // 🔥 Cerrar orden con auditoría
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CLOSED,
          closedAt: new Date(),
          updatedById: userId,
        },
      });

      return sale;
    });
  }

  /**
   * 🔎 LISTAR SALES
   */
  async findAll(restaurantId: string, query: FindSalesDto) {
    const where: Prisma.SaleWhereInput = {
      restaurantId,
      ...(query.orderId && { orderId: query.orderId }),
    };

    return this.prisma.sale.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            status: true,
            type: true,
            orderNumber: true,
          },
        },
        payment: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 🔎 OBTENER UNA SALE
   */
  async findOne(id: string, restaurantId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, restaurantId },
      include: {
        order: true,
        payment: true,
        invoice: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }
}
