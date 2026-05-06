import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================
  // 🔎 FIND ALL
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
  // 🔎 FIND ONE
  // ============================
  async findOne(id: string, restaurantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, restaurantId },
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
  // 🧾 PRINT (CLAVE 🔥)
  // ============================
  async print(id: string, restaurantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, restaurantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // 🔥 SI TIENE SNAPSHOT → usarlo
    if (invoice.responseJson) {
      return invoice.responseJson;
    }

    // ⚠️ fallback (por si alguna factura vieja no lo tiene)
    return {
      message: 'Invoice has no snapshot',
      invoice,
    };
  }

  // ============================
  // 🟢 MARK AS ACCEPTED (DIAN SIM)
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
        cufe: `CUFE-${Date.now()}`,
      },
    });
  }
}
