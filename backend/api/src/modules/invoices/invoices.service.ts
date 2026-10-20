import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { BILLING_PROVIDER } from './billing-provider';
import type { BillingProvider } from './billing-provider';

const ELECTRONIC_BILLING_KEY = 'electronicBilling';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(BILLING_PROVIDER)
    private readonly billing: BillingProvider,
  ) {}

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

  async findOne(id: string, restaurantId: string) {
    return this.requireInvoice(id, restaurantId);
  }

  /** POS receipt snapshot only — fiscal payload is stripped. */
  async print(id: string, restaurantId: string) {
    const invoice = await this.requireInvoice(id, restaurantId);

    if (!invoice.responseJson) {
      return {
        message: 'Invoice has no snapshot',
        invoice,
      };
    }

    return this.receiptFromSnapshot(invoice.responseJson);
  }

  async markAccepted(id: string, restaurantId: string) {
    const invoice = await this.requirePending(id, restaurantId);
    const issued = await this.billing.issue(this.toBillingInput(invoice));

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.ACCEPTED,
        cufe: issued.cufe,
        responseJson: this.mergeFiscal(invoice.responseJson, issued.payload),
      },
    });
  }

  async markRejected(id: string, restaurantId: string, reason?: string) {
    const invoice = await this.requirePending(id, restaurantId);
    const rejected = await this.billing.reject(
      this.toBillingInput(invoice),
      reason?.trim() || 'Rejected by cashier',
    );

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.REJECTED,
        cufe: rejected.cufe,
        responseJson: this.mergeFiscal(invoice.responseJson, rejected.payload),
      },
    });
  }

  private async requireInvoice(id: string, restaurantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, restaurantId },
      include: {
        sale: true,
        payment: true,
        restaurant: {
          select: { name: true, nit: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  private async requirePending(id: string, restaurantId: string) {
    const invoice = await this.requireInvoice(id, restaurantId);
    if (invoice.status !== InvoiceStatus.PENDING) {
      throw new BadRequestException(
        `Invoice already ${invoice.status.toLowerCase()}`,
      );
    }
    return invoice;
  }

  private toBillingInput(
    invoice: Awaited<ReturnType<InvoicesService['requireInvoice']>>,
  ) {
    return {
      invoiceId: invoice.id,
      number: invoice.number,
      restaurantNit: invoice.restaurant.nit,
      restaurantName: invoice.restaurant.name,
      totalCents: invoice.totalCents,
      currency: invoice.currency,
    };
  }

  private mergeFiscal(
    snapshot: Prisma.JsonValue | null,
    fiscal: Record<string, unknown>,
  ): Prisma.InputJsonValue {
    const base =
      snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot)
        ? { ...(snapshot as Record<string, unknown>) }
        : {};
    return JSON.parse(
      JSON.stringify({
        ...base,
        [ELECTRONIC_BILLING_KEY]: fiscal,
      }),
    ) as Prisma.InputJsonValue;
  }

  private receiptFromSnapshot(snapshot: Prisma.JsonValue) {
    if (typeof snapshot !== 'object' || snapshot === null || Array.isArray(snapshot)) {
      return snapshot;
    }
    const { [ELECTRONIC_BILLING_KEY]: _fiscal, ...receipt } = snapshot as Record<
      string,
      unknown
    >;
    void _fiscal;
    return receipt;
  }
}
