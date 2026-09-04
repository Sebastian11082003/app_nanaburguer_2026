import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CashSessionStatus, CashType, PaymentMethod } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SALE_PAYMENT_CONCEPT } from './cash.constants';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import { OpenCashSessionDto } from './dto/open-cash-session.dto';

const SESSION_INCLUDE = {
  openedBy: { select: { id: true, fullName: true } },
  closedBy: { select: { id: true, fullName: true } },
} as const;

export type CashSessionPreview = {
  salesTotalCents: number;
  cashSalesCents: number;
  cardSalesCents: number;
  transferSalesCents: number;
  otherSalesCents: number;
  manualIncomeCents: number;
  expenseCents: number;
  expectedCashCents: number;
  byMethod: Array<{
    method: PaymentMethod;
    totalCents: number;
    count: number;
  }>;
};

/**
 * Tenant cash book + one open shift at a time.
 * Closing freezes sales-by-method and expected drawer so HU-025 keeps
 * a historical record instead of recomputing forever.
 */
@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateCashMovementDto,
    restaurantId: string,
    userId: string,
  ) {
    return this.prisma.cashMovement.create({
      data: {
        type: dto.type,
        concept: dto.concept,
        reference: dto.reference,
        amountCents: dto.amountCents,
        restaurantId,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async findAll(restaurantId: string, from?: Date) {
    return this.prisma.cashMovement.findMany({
      where: {
        restaurantId,
        ...(from ? { createdAt: { gte: from } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async currentSession(restaurantId: string) {
    const session = await this.prisma.cashSession.findFirst({
      where: { restaurantId, status: CashSessionStatus.OPEN },
      include: SESSION_INCLUDE,
    });

    if (!session) {
      return { session: null, preview: null };
    }

    const preview = await this.computePreview(
      restaurantId,
      session.openedAt,
      new Date(),
      session.openingCents,
    );

    return { session, preview };
  }

  async listSessions(restaurantId: string) {
    return this.prisma.cashSession.findMany({
      where: { restaurantId },
      orderBy: { openedAt: 'desc' },
      take: 40,
      include: SESSION_INCLUDE,
    });
  }

  async findSession(id: string, restaurantId: string) {
    const session = await this.prisma.cashSession.findFirst({
      where: { id, restaurantId },
      include: SESSION_INCLUDE,
    });

    if (!session) {
      throw new NotFoundException('Cash session not found');
    }

    if (session.status === CashSessionStatus.OPEN) {
      const preview = await this.computePreview(
        restaurantId,
        session.openedAt,
        new Date(),
        session.openingCents,
      );
      return { session, preview };
    }

    return { session, preview: this.previewFromFrozen(session) };
  }

  async openSession(
    dto: OpenCashSessionDto,
    restaurantId: string,
    userId: string,
  ) {
    const open = await this.prisma.cashSession.findFirst({
      where: { restaurantId, status: CashSessionStatus.OPEN },
      select: { id: true },
    });

    if (open) {
      throw new BadRequestException('A cash session is already open');
    }

    return this.prisma.cashSession.create({
      data: {
        restaurantId,
        openedById: userId,
        openingCents: dto.openingCents,
        notes: dto.notes,
        status: CashSessionStatus.OPEN,
      },
      include: SESSION_INCLUDE,
    });
  }

  async closeSession(
    id: string,
    dto: CloseCashSessionDto,
    restaurantId: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.cashSession.findFirst({
        where: { id, restaurantId },
      });

      if (!session) {
        throw new NotFoundException('Cash session not found');
      }

      if (session.status !== CashSessionStatus.OPEN) {
        throw new BadRequestException('Cash session is already closed');
      }

      const closedAt = new Date();
      const preview = await this.computePreview(
        restaurantId,
        session.openedAt,
        closedAt,
        session.openingCents,
        tx,
      );

      const countedCents = dto.countedCents;
      const differenceCents =
        countedCents === undefined
          ? null
          : countedCents - preview.expectedCashCents;

      return tx.cashSession.update({
        where: { id: session.id },
        data: {
          status: CashSessionStatus.CLOSED,
          closedAt,
          closedById: userId,
          countedCents: countedCents ?? null,
          differenceCents,
          notes: dto.notes ?? session.notes,
          salesTotalCents: preview.salesTotalCents,
          cashSalesCents: preview.cashSalesCents,
          cardSalesCents: preview.cardSalesCents,
          transferSalesCents: preview.transferSalesCents,
          otherSalesCents: preview.otherSalesCents,
          manualIncomeCents: preview.manualIncomeCents,
          expenseCents: preview.expenseCents,
          expectedCashCents: preview.expectedCashCents,
        },
        include: SESSION_INCLUDE,
      });
    });
  }

  async computePreview(
    restaurantId: string,
    openedAt: Date,
    closedAt: Date,
    openingCents: number,
    db: Pick<PrismaService, 'payment' | 'cashMovement'> = this.prisma,
  ): Promise<CashSessionPreview> {
    const payments = await db.payment.groupBy({
      by: ['method'],
      where: {
        restaurantId,
        paidAt: { gte: openedAt, lte: closedAt },
      },
      _sum: { amountCents: true },
      _count: true,
    });

    const methodTotal = (method: PaymentMethod) =>
      payments.find((row) => row.method === method)?._sum.amountCents ?? 0;

    const cashSalesCents = methodTotal(PaymentMethod.CASH);
    const cardSalesCents = methodTotal(PaymentMethod.CARD);
    const transferSalesCents = methodTotal(PaymentMethod.TRANSFER);
    const otherSalesCents = methodTotal(PaymentMethod.OTHER);

    const movements = await db.cashMovement.findMany({
      where: {
        restaurantId,
        createdAt: { gte: openedAt, lte: closedAt },
        NOT: { concept: SALE_PAYMENT_CONCEPT },
      },
      select: { type: true, amountCents: true },
    });

    let manualIncomeCents = 0;
    let expenseCents = 0;
    for (const row of movements) {
      if (row.type === CashType.INCOME) {
        manualIncomeCents += row.amountCents;
      } else {
        expenseCents += row.amountCents;
      }
    }

    return {
      salesTotalCents:
        cashSalesCents + cardSalesCents + transferSalesCents + otherSalesCents,
      cashSalesCents,
      cardSalesCents,
      transferSalesCents,
      otherSalesCents,
      manualIncomeCents,
      expenseCents,
      expectedCashCents:
        openingCents + cashSalesCents + manualIncomeCents - expenseCents,
      byMethod: payments.map((row) => ({
        method: row.method,
        totalCents: row._sum.amountCents ?? 0,
        count: row._count,
      })),
    };
  }

  private previewFromFrozen(session: {
    salesTotalCents: number | null;
    cashSalesCents: number | null;
    cardSalesCents: number | null;
    transferSalesCents: number | null;
    otherSalesCents: number | null;
    manualIncomeCents: number | null;
    expenseCents: number | null;
    expectedCashCents: number | null;
  }): CashSessionPreview {
    const cash = session.cashSalesCents ?? 0;
    const card = session.cardSalesCents ?? 0;
    const transfer = session.transferSalesCents ?? 0;
    const other = session.otherSalesCents ?? 0;

    return {
      salesTotalCents: session.salesTotalCents ?? cash + card + transfer + other,
      cashSalesCents: cash,
      cardSalesCents: card,
      transferSalesCents: transfer,
      otherSalesCents: other,
      manualIncomeCents: session.manualIncomeCents ?? 0,
      expenseCents: session.expenseCents ?? 0,
      expectedCashCents: session.expectedCashCents ?? 0,
      byMethod: (
        [
          [PaymentMethod.CASH, cash],
          [PaymentMethod.CARD, card],
          [PaymentMethod.TRANSFER, transfer],
          [PaymentMethod.OTHER, other],
        ] as const
      )
        .filter(([, total]) => total > 0)
        .map(([method, totalCents]) => ({
          method,
          totalCents,
          count: 0,
        })),
    };
  }
}
