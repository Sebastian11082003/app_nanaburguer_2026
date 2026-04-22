import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FindPaymentsDto } from './dto/find-payment.dto';

import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, restaurantId: string, userId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id: dto.saleId,
        restaurantId,
      },
      include: {
        payment: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    if (sale.payment) {
      throw new BadRequestException('Sale already paid');
    }

    if (dto.amountCents !== sale.totalCents) {
      throw new BadRequestException('Amount mismatch');
    }

    return this.prisma.payment.create({
      data: {
        saleId: sale.id,
        restaurantId,
        method: dto.method,
        amountCents: dto.amountCents,
        currency: dto.currency ?? 'COP',
        paidAt: new Date(),
        createdById: userId,
      },
    });
  }

  async findAll(restaurantId: string, query: FindPaymentsDto) {
    const where: Prisma.PaymentWhereInput = {
      restaurantId,
      ...(query.saleId && { saleId: query.saleId }),
      ...(query.method && { method: query.method }),
      ...(query.createdById && { createdById: query.createdById }),
    };

    return this.prisma.payment.findMany({
      where,
      orderBy: {
        paidAt: 'desc',
      },
      include: {
        sale: {
          include: {
            order: true,
          },
        },
      },
    });
  }

  async findOne(id: string, restaurantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        restaurantId,
      },
      include: {
        sale: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
