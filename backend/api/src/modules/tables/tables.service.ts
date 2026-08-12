import { Injectable, NotFoundException } from '@nestjs/common';

import { ACTIVE_ORDER_STATUSES } from '../../common/constants/order-status.constants';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

/**
 * TablesService owns the physical tables of a restaurant (dine-in only).
 *
 * A table does NOT store its own "occupied/available" status: that state
 * is derived on read from whether the table has an open (non-CLOSED,
 * non-CANCELED) order attached. This keeps a single source of truth
 * (the Order lifecycle) instead of duplicating status in two places that
 * could drift out of sync.
 */
@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Shared Prisma `include` so `findAll` and `findOne` stay consistent. */
  private static readonly WITH_ACTIVE_ORDER = {
    orders: {
      where: {
        status: { in: ACTIVE_ORDER_STATUSES },
      },
      // A table should have at most one active order at a time
      // (enforced by OrdersService.create's dedupe check), so the most
      // recent one is enough context for the UI.
      orderBy: { createdAt: 'desc' as const },
      take: 1,
      // Include the menu item name so the admin table detail view can
      // show real product names, not just "1x item".
      include: { items: { include: { menuItem: { select: { name: true } } } } },
    },
  };

  /**
   * Reshapes the raw Prisma `orders: [...]` array (from the include above)
   * into a single `activeOrder` field, which is a much simpler contract
   * for the frontend than "an array that only ever has 0 or 1 items".
   */
  private static withActiveOrder<T extends { orders: unknown[] }>(
    table: T,
  ): Omit<T, 'orders'> & { activeOrder: T['orders'][number] | null } {
    const { orders, ...rest } = table;
    return { ...rest, activeOrder: orders[0] ?? null };
  }

  /** Creates a new table for the tenant. Always starts as active. */
  async create(dto: CreateTableDto, restaurantId: string) {
    return this.prisma.tableEntity.create({
      data: {
        label: dto.label,
        capacity: dto.capacity,
        isActive: true,
        restaurantId,
      },
    });
  }

  /** Lists every table for the tenant, including its current active order (if any). */
  async findAll(restaurantId: string) {
    const tables = await this.prisma.tableEntity.findMany({
      where: { restaurantId },
      orderBy: { id: 'asc' },
      include: TablesService.WITH_ACTIVE_ORDER,
    });

    return tables.map((table) => TablesService.withActiveOrder(table));
  }

  /** Fetches one table scoped to the tenant, including its active order. */
  async findOne(id: string, restaurantId: string) {
    const table = await this.prisma.tableEntity.findFirst({
      where: { id, restaurantId },
      include: TablesService.WITH_ACTIVE_ORDER,
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return TablesService.withActiveOrder(table);
  }

  /** Partially updates a table (label, capacity, active flag). Admin only. */
  async update(id: string, dto: UpdateTableDto, restaurantId: string) {
    const existing = await this.prisma.tableEntity.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Table not found');
    }

    return this.prisma.tableEntity.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }
}
