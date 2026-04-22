import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================
  // CREATE INVOICE
  // ============================
  async create(
    dto: { saleId: string; paymentId: string },
    restaurantId: string,
  ) {
    // 🔎 traer sale + payment
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

    const payment = await this.prisma.payment.findFirst({
      where: {
        id: dto.paymentId,
        restaurantId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // ❌ validar relación correcta
    if (payment.saleId !== sale.id) {
      throw new BadRequestException('Payment does not belong to sale');
    }

    // ❌ validar monto
    if (payment.amountCents !== sale.totalCents) {
      throw new BadRequestException('Payment amount mismatch');
    }

    // ❌ evitar duplicados
    const existing = await this.prisma.invoice.findFirst({
      where: {
        saleId: sale.id,
      },
    });

    if (existing) {
      throw new BadRequestException('Invoice already exists for this sale');
    }

    // 🔢 generar número factura (simple por ahora)
    const number = `INV-${Date.now()}`;

    // 🧾 crear invoice
    return this.prisma.invoice.create({
      data: {
        saleId: sale.id,
        paymentId: payment.id,
        restaurantId,

        number,
        status: 'PENDING',

        totalCents: sale.totalCents,
        currency: payment.currency,
      },
    });
  }

  // ============================
  // FIND ALL
  // ============================
  async findAll(restaurantId: string) {
    return this.prisma.invoice.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        sale: true,
        payment: true,
      },
    });
  }

  // ============================
  // FIND ONE
  // ============================
  async findOne(id: string, restaurantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        restaurantId,
      },
      include: {
        sale: true,
        payment: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  // ============================
  // MARK AS ACCEPTED (DIAN SIMULATION)
  // ============================
  async markAccepted(id: string, restaurantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, restaurantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        cufe: `CUFE-${Date.now()}`, // simulado
        responseJson: {
          ok: true,
          message: 'Accepted by DIAN',
        },
      },
    });
  }
}
