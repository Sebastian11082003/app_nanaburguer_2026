import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { FindSalesDto } from './dto/find-sales.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🔥 CREA SALE A PARTIR DE UNA ORDEN
   * SOLO DEBE USARSE DESDE OrdersService
   */
  async createFromOrder(orderId: string, restaurantId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
      include: {
        sale: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.sale) {
      throw new BadRequestException('Sale already exists for this order');
    }

    return this.prisma.sale.create({
      data: {
        orderId: order.id,
        restaurantId,
        totalCents: order.totalCents,
      },
    });
  }

  /**
   * 🔎 LISTAR SALES
   */
  async findAll(restaurantId: string, query: FindSalesDto) {
    const where: Prisma.SaleWhereInput = {
      restaurantId,
      ...(query.orderId ? { orderId: query.orderId } : {}),
    };

    return this.prisma.sale.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            status: true,
            type: true,
          },
        },
        payment: true,
        invoice: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 🔎 OBTENER UNA SALE
   */
  async findOne(id: string, restaurantId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id,
        restaurantId,
      },
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
