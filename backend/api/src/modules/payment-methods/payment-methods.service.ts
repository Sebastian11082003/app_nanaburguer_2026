import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { DEFAULT_PAYMENT_METHODS } from './payment-methods.defaults';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Inserts any missing default methods for the tenant (idempotent).
   * Safe to call on every list — covers restaurants created before this feature.
   */
  async ensureDefaults(
    restaurantId: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const existing = await tx.restaurantPaymentMethod.findMany({
      where: { restaurantId },
      select: { method: true },
    });
    const have = new Set(existing.map((row) => row.method));
    const missing = DEFAULT_PAYMENT_METHODS.filter((d) => !have.has(d.method));

    if (missing.length === 0) return;

    await tx.restaurantPaymentMethod.createMany({
      data: missing.map((d) => ({
        restaurantId,
        method: d.method,
        label: d.label,
        sortOrder: d.sortOrder,
        isActive: true,
      })),
      skipDuplicates: true,
    });
  }

  /** Seeds defaults inside an existing transaction (e.g. platform createRestaurant). */
  async seedForRestaurant(
    restaurantId: string,
    tx: Prisma.TransactionClient,
  ) {
    await tx.restaurantPaymentMethod.createMany({
      data: DEFAULT_PAYMENT_METHODS.map((d) => ({
        restaurantId,
        method: d.method,
        label: d.label,
        sortOrder: d.sortOrder,
        isActive: true,
      })),
      skipDuplicates: true,
    });
  }

  async findAll(restaurantId: string, activeOnly = false) {
    await this.ensureDefaults(restaurantId);

    return this.prisma.restaurantPaymentMethod.findMany({
      where: {
        restaurantId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { method: 'asc' }],
    });
  }

  async update(
    id: string,
    restaurantId: string,
    dto: UpdatePaymentMethodDto,
  ) {
    const row = await this.prisma.restaurantPaymentMethod.findFirst({
      where: { id, restaurantId },
    });

    if (!row) {
      throw new NotFoundException('Payment method not found');
    }

    if (dto.isActive === false && row.isActive) {
      const activeCount = await this.prisma.restaurantPaymentMethod.count({
        where: { restaurantId, isActive: true },
      });
      if (activeCount <= 1) {
        throw new BadRequestException(
          'Debe quedar al menos un método de pago activo',
        );
      }
    }

    return this.prisma.restaurantPaymentMethod.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });
  }

  /** Throws if the method is missing or inactive for this tenant. */
  async assertActive(
    restaurantId: string,
    method: PaymentMethod,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    await this.ensureDefaults(restaurantId, tx);

    const row = await tx.restaurantPaymentMethod.findUnique({
      where: {
        restaurantId_method: { restaurantId, method },
      },
    });

    if (!row || !row.isActive) {
      throw new BadRequestException(
        `Método de pago no disponible: ${method}`,
      );
    }

    return row;
  }
}
