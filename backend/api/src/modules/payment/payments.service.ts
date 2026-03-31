import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FindPaymentsDto } from './dto/find-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, currentUserId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.payment) {
      throw new BadRequestException('Order already has a payment registered');
    }

    if (dto.amountCents !== order.totalCents) {
      throw new BadRequestException(
        `Payment amount must match order total (${order.totalCents})`,
      );
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const payment = await tx.payment.create({
        data: {
          orderId: dto.orderId,
          method: dto.method,
          amountCents: dto.amountCents,
          currency: dto.currency ?? 'COP',
          createdById: currentUserId,
        },
        include: {
          order: {
            select: {
              id: true,
              type: true,
              status: true,
              totalCents: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      const nextStatus =
        order.status === OrderStatus.OUT_FOR_DELIVERY
          ? OrderStatus.DELIVERED
          : OrderStatus.CLOSED;

      await tx.order.update({
        where: { id: dto.orderId },
        data: {
          status: nextStatus,
          updatedById: currentUserId,
          ...(nextStatus === OrderStatus.CLOSED ||
          nextStatus === OrderStatus.DELIVERED
            ? { closedAt: new Date() }
            : {}),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: dto.orderId,
          fromStatus: order.status,
          toStatus: nextStatus,
          changedById: currentUserId,
        },
      });

      return payment;
    });
  }

  async findAll(filters: FindPaymentsDto) {
    return this.prisma.payment.findMany({
      where: {
        ...(filters.orderId ? { orderId: filters.orderId } : {}),
        ...(filters.method ? { method: filters.method } : {}),
        ...(filters.createdById ? { createdById: filters.createdById } : {}),
      },
      include: {
        order: {
          select: {
            id: true,
            type: true,
            status: true,
            totalCents: true,
            customerName: true,
            customerPhone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
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
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
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
