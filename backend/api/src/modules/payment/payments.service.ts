import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FindPaymentsDto } from './dto/find-payment.dto';

import {
  Prisma,
  PaymentMethod,
  CashType,
  OrderStatus,
  Payment, // ✅ IMPORT CORRECTO
} from '@prisma/client';

import { PaymentMethodsService } from '../payment-methods/payment-methods.service';

type SaleWithRelations = Prisma.SaleGetPayload<{
  include: {
    restaurant: {
      select: {
        name: true;
        nit: true;
        phone: true;
        address: true; // CLAVE
        logoUrl: true; // shown on the printed receipt, like a masthead
      };
    };
    payment: true;
    order: {
      include: {
        table: true;
        delivery: true;
        items: {
          include: {
            menuItem: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  async create(
    saleId: string,
    dto: CreatePaymentDto,
    restaurantId: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const sale = (await tx.sale.findFirst({
        where: { id: saleId, restaurantId },
        include: {
          payment: true,
          restaurant: true,
          order: {
            include: {
              table: true,
              delivery: true,
              items: {
                include: { menuItem: true },
              },
            },
          },
        },
      })) as SaleWithRelations;

      if (!sale) throw new NotFoundException('Sale not found');

      if (sale.payment) {
        throw new BadRequestException('Sale already paid');
      }

      if (sale.order.status !== OrderStatus.CLOSED) {
        throw new BadRequestException('Order must be CLOSED');
      }

      const methodConfig = await this.paymentMethodsService.assertActive(
        restaurantId,
        dto.method,
        tx,
      );

      // 🔥 TIP LOGIC (CLARA)
      const suggestedTip = Math.round(sale.totalCents * 0.05);
      const tip = dto.tipCents ?? 0;

      const expected = sale.totalCents + tip;

      if (dto.amountCents !== expected) {
        throw new BadRequestException(`Invalid amount. Expected ${expected}`);
      }

      // 💰 CAMBIO
      let changeCents = 0;

      if (dto.method === PaymentMethod.CASH) {
        if (dto.receivedCents == null) {
          throw new BadRequestException('receivedCents required for CASH');
        }

        if (dto.receivedCents < expected) {
          throw new BadRequestException('Insufficient cash');
        }

        changeCents = dto.receivedCents - expected;
      }

      // 💳 PAYMENT
      const payment = await tx.payment.create({
        data: {
          saleId: sale.id,
          restaurantId,
          method: dto.method,
          amountCents: dto.amountCents,
          tipCents: tip,
          tipSuggestedCents: suggestedTip, // 🔥 importante
          currency: dto.currency ?? 'COP',
          createdById: userId,
        },
      });

      // 💵 CAJA
      if (dto.method === PaymentMethod.CASH) {
        await tx.cashMovement.create({
          data: {
            type: CashType.INCOME,
            concept: 'SALE_PAYMENT',
            reference: sale.id,
            amountCents: dto.amountCents,
            createdById: userId,
            restaurantId,
          },
        });
      }

      // 🧾 FACTURA
      const invoice = await this.buildInvoice(
        tx,
        sale,
        payment,
        restaurantId,
        dto,
        changeCents,
        userId,
        methodConfig.label,
      );

      return {
        payment,
        changeCents,
        invoice,
      };
    });
  }

  /**
   * 🧾 SNAPSHOT FACTURA (TIPO TICKET)
   */
  private async buildInvoice(
    tx: Prisma.TransactionClient,
    sale: SaleWithRelations,
    payment: Payment,
    restaurantId: string,
    dto: CreatePaymentDto,
    changeCents: number,
    userId: string,
    methodLabel: string,
  ) {
    const { restaurant, order } = sale;

    const items = order.items.map((i) => ({
      name: i.menuItem.name,
      quantity: i.quantity,
      unitPrice: i.unitPriceCents,
      total: i.lineTotalCents,
      notes: i.notes,
    }));

    return tx.invoice.create({
      data: {
        saleId: sale.id,
        paymentId: payment.id,
        restaurantId,

        number: `INV-${Date.now()}`,
        status: 'PENDING',

        totalCents: payment.amountCents,
        currency: payment.currency,

        responseJson: {
          restaurant: {
            name: restaurant.name,
            nit: restaurant.nit,
            phone: restaurant.phone,
            address: restaurant.address,
            logoUrl: restaurant.logoUrl,
          },

          invoice: {
            number: `INV-${Date.now()}`,
            date: new Date(),
          },

          order: {
            number: order.orderNumber,
            type: order.type,
            table: order.table?.label ?? null,
          },
          delivery: order.delivery
            ? {
                customerName: order.delivery.customerName,
                phone: order.delivery.phone,
                address: order.delivery.address,

                takenAt: order.delivery.takenAt,
                printedAt: order.delivery.printedAt,
                dispatchedAt: order.delivery.dispatchedAt,
                deliveredAt: order.delivery.deliveredAt,
              }
            : null,

          staff: {
            waiter: order.createdById ?? null,
            cashier: userId,
          },

          items,

          totals: {
            subtotal: order.subtotalCents,
            discount: order.discountCents ?? 0,
            tip: payment.tipCents ?? 0,
            total: payment.amountCents,
          },

          payment: {
            method: payment.method,
            methodLabel,
            received: dto.receivedCents ?? null,
            change: changeCents,
            paidAt: payment.paidAt,
          },
          legal: {
            tipDisclaimer:
              'La propina es un reconocimiento voluntario por el buen servicio prestado. ' +
              'De acuerdo con la Ley 1935 de 2018, el cliente puede aceptarla, modificarla ' +
              'o rechazarla libremente. Este establecimiento sugiere una propina del 5%.',
            tipSuggestedPercent: 5,
            tipIsOptional: true,
          },
        },
      },
    });
  }

  async findAll(restaurantId: string, query: FindPaymentsDto) {
    return this.prisma.payment.findMany({
      where: {
        restaurantId,
        ...(query.saleId && { saleId: query.saleId }),
      },
      orderBy: {
        paidAt: 'desc',
      },
      include: {
        sale: true,
        invoice: true,
      },
    });
  }

  async findOne(id: string, restaurantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, restaurantId },
      include: {
        sale: true,
        invoice: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
