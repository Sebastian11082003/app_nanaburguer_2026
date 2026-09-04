import { Injectable } from '@nestjs/common';
import { OrderType } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { createdAtFilter, DateRange } from './report-range';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(restaurantId: string) {
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      salesToday,
      salesWeek,
      salesMonth,
      totalOrders,
      activeTables,
      deliveriesToday,
      paymentMethods,
      topProducts,
    ] = await Promise.all([
      this.revenueByRange(restaurantId, todayStart, now),
      this.revenueByRange(restaurantId, weekStart, now),
      this.revenueByRange(restaurantId, monthStart, now),
      this.prisma.order.count({
        where: { restaurantId },
      }),
      this.prisma.tableEntity.count({
        where: {
          restaurantId,
          isActive: true,
        },
      }),
      this.prisma.delivery.count({
        where: {
          restaurantId,
          createdAt: { gte: todayStart },
        },
      }),
      this.salesByPaymentMethod(restaurantId),
      this.topProducts(restaurantId),
    ]);

    return {
      salesToday: salesToday.total,
      salesWeek: salesWeek.total,
      salesMonth: salesMonth.total,
      totalOrders,
      activeTables,
      deliveriesToday,
      topProduct: topProducts.length > 0 ? topProducts[0] : null,
      paymentMethods,
    };
  }

  async summary(restaurantId: string, range: DateRange = {}) {
    const createdAt = createdAtFilter(range);
    const [sales, orders] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { restaurantId, ...(createdAt ? { createdAt } : {}) },
        _sum: { totalCents: true },
        _count: true,
      }),
      this.prisma.order.count({
        where: { restaurantId, ...(createdAt ? { createdAt } : {}) },
      }),
    ]);

    return {
      totalRevenue: sales._sum.totalCents ?? 0,
      totalSales: sales._count,
      totalOrders: orders,
    };
  }

  async deliverySummary(restaurantId: string, range: DateRange = {}) {
    const createdAt = createdAtFilter(range);
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        restaurantId,
        ...(createdAt ? { createdAt } : {}),
      },
      include: {
        order: {
          include: {
            sale: true,
          },
        },
      },
    });

    const isPickup = (type: OrderType) => type === OrderType.PICKUP;
    const pickups = deliveries.filter((row) => isPickup(row.order.type));
    const homes = deliveries.filter((row) => !isPickup(row.order.type));

    const revenueOf = (rows: typeof deliveries) =>
      rows.reduce((acc, row) => acc + (row.order.sale?.totalCents ?? 0), 0);

    const paymentCounts = (rows: typeof deliveries) => ({
      cash: rows.filter((row) => row.paymentMethod === 'CASH').length,
      card: rows.filter((row) => row.paymentMethod === 'CARD').length,
      transfer: rows.filter((row) => row.paymentMethod === 'TRANSFER').length,
    });

    return {
      totalDeliveries: homes.length,
      totalPickups: pickups.length,
      totalRevenue: revenueOf(homes),
      pickupRevenue: revenueOf(pickups),
      payments: paymentCounts(homes),
      pickupPayments: paymentCounts(pickups),
    };
  }

  async salesByDay(restaurantId: string, range: DateRange = {}) {
    const createdAt = createdAtFilter(range);
    const sales = await this.prisma.sale.findMany({
      where: { restaurantId, ...(createdAt ? { createdAt } : {}) },
      select: { createdAt: true, totalCents: true },
      orderBy: { createdAt: 'asc' },
    });

    const byDay = new Map<string, number>();
    for (const sale of sales) {
      const date = sale.createdAt.toISOString().slice(0, 10);
      byDay.set(date, (byDay.get(date) ?? 0) + sale.totalCents);
    }

    return [...byDay.entries()].map(([date, total]) => ({ date, total }));
  }

  async salesByPaymentMethod(restaurantId: string, range: DateRange = {}) {
    const paidAt = createdAtFilter(range);
    const result = await this.prisma.payment.groupBy({
      by: ['method'],
      where: { restaurantId, ...(paidAt ? { paidAt } : {}) },
      _sum: {
        amountCents: true,
      },
      _count: true,
    });

    return result.map((row) => ({
      method: row.method,
      total: row._sum.amountCents ?? 0,
      count: row._count,
    }));
  }

  async topProducts(restaurantId: string, range: DateRange = {}) {
    const createdAt = createdAtFilter(range);
    const result = await this.prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          restaurantId,
          ...(createdAt ? { sale: { createdAt } } : {}),
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
        id: { in: result.map((row) => row.menuItemId) },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return result.map((row) => {
      const item = items.find((menuItem) => menuItem.id === row.menuItemId);

      return {
        menuItemId: row.menuItemId,
        name: item?.name ?? 'Unknown',
        quantity: row._sum.quantity ?? 0,
      };
    });
  }

  async ordersByStatus(restaurantId: string, range: DateRange = {}) {
    const createdAt = createdAtFilter(range);
    const rows = await this.prisma.order.groupBy({
      by: ['status'],
      where: { restaurantId, ...(createdAt ? { createdAt } : {}) },
      _count: true,
    });

    return rows
      .map((row) => ({
        status: row.status,
        count: row._count,
      }))
      .sort((a, b) => b.count - a.count);
  }

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
