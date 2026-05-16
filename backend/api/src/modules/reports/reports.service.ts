import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================
  // RESUMEN GENERAL
  // ============================
  async summary(restaurantId: string) {
    const [sales, orders] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { restaurantId },
        _sum: { totalCents: true },
        _count: true,
      }),
      this.prisma.order.count({
        where: { restaurantId },
      }),
    ]);

    return {
      totalRevenue: sales._sum.totalCents ?? 0,
      totalSales: sales._count,
      totalOrders: orders,
    };
  }
  // ============================
  // DELIVERY SUMMARY
  // ============================
  async deliverySummary(restaurantId: string) {
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        restaurantId,
      },

      include: {
        order: {
          include: {
            sale: true,
          },
        },
      },
    });

    const totalDeliveries = deliveries.length;

    const totalRevenue = deliveries.reduce(
      (acc, d) => acc + (d.order.sale?.totalCents ?? 0),
      0,
    );

    const cashPayments = deliveries.filter(
      (d) => d.paymentMethod === 'CASH',
    ).length;

    const cardPayments = deliveries.filter(
      (d) => d.paymentMethod === 'CARD',
    ).length;

    const transferPayments = deliveries.filter(
      (d) => d.paymentMethod === 'TRANSFER',
    ).length;

    return {
      totalDeliveries,
      totalRevenue,

      payments: {
        cash: cashPayments,
        card: cardPayments,
        transfer: transferPayments,
      },
    };
  }

  // ============================
  // VENTAS POR DÍA
  // ============================
  async salesByDay(restaurantId: string) {
    const result = await this.prisma.$queryRaw<
      { date: string; total: number }[]
    >`
      SELECT 
        DATE("createdAt") as date,
        SUM("totalCents") as total
      FROM sale
      WHERE "restaurantId" = ${restaurantId}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return result;
  }

  // ============================
  // VENTAS POR MÉTODO DE PAGO
  // ============================
  async salesByPaymentMethod(restaurantId: string) {
    const result = await this.prisma.payment.groupBy({
      by: ['method'],
      where: { restaurantId },
      _sum: {
        amountCents: true,
      },
      _count: true,
    });

    return result.map((r) => ({
      method: r.method,
      total: r._sum.amountCents ?? 0,
      count: r._count,
    }));
  }

  // ============================
  // TOP PRODUCTOS
  // ============================
  async topProducts(restaurantId: string) {
    const result = await this.prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          restaurantId,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const items = await this.prisma.menuItem.findMany({
      where: {
        id: { in: result.map((r) => r.menuItemId) },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return result.map((r) => {
      const item = items.find((i) => i.id === r.menuItemId);

      return {
        menuItemId: r.menuItemId,
        name: item?.name ?? 'Unknown',
        quantity: r._sum.quantity ?? 0,
      };
    });
  }
  // ============================
  // INGRESOS POR RANGO DE FECHAS
  // ============================
  async revenueByRange(restaurantId: string, start: Date, end: Date) {
    const result = await this.prisma.sale.aggregate({
      where: {
        restaurantId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        totalCents: true,
      },
    });

    return {
      total: result._sum.totalCents ?? 0,
    };
  }
}
