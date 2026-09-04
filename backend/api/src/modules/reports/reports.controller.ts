import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { ReportsService } from './reports.service';
import { RevenueRangeDto } from './dto/revenue-reange.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

/**
 * Sales metrics for admin/cashier. Until @Roles was added, RolesGuard was a
 * no-op here — any authenticated station (waiter/kitchen/delivery) could
 * read revenue. REPORTS_VIEW is already in the catalog for those two stations.
 */
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
@Roles(UserRole.ADMIN, UserRole.CASHIER)
@Permissions('REPORTS_VIEW')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('summary')
  summary(@Tenant() restaurantId: string) {
    return this.service.summary(restaurantId);
  }
  @Get('delivery/summary')
  deliverySummary(@Tenant() restaurantId: string) {
    return this.service.deliverySummary(restaurantId);
  }
  @Get('dashboard')
  dashboard(@Tenant() restaurantId: string) {
    return this.service.dashboard(restaurantId);
  }

  @Get('sales-by-day')
  salesByDay(@Tenant() restaurantId: string) {
    return this.service.salesByDay(restaurantId);
  }

  @Get('payment-methods')
  paymentMethods(@Tenant() restaurantId: string) {
    return this.service.salesByPaymentMethod(restaurantId);
  }

  @Get('top-products')
  topProducts(@Tenant() restaurantId: string) {
    return this.service.topProducts(restaurantId);
  }

  @Get('revenue-range')
  revenueRange(
    @Tenant() restaurantId: string,
    @Query() query: RevenueRangeDto,
  ) {
    return this.service.revenueByRange(
      restaurantId,
      new Date(query.start),
      new Date(query.end),
    );
  }
}
