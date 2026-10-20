import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalReportRangeDto } from './dto/optional-report-range.dto';
import { RevenueRangeDto } from './dto/revenue-reange.dto';
import { parseDayRange } from './report-range';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
@Roles(UserRole.ADMIN, UserRole.CASHIER)
@Permissions('REPORTS_VIEW')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('summary')
  summary(
    @Tenant() restaurantId: string,
    @Query() query: OptionalReportRangeDto,
  ) {
    return this.service.summary(restaurantId, parseDayRange(query.from, query.to));
  }

  @Get('delivery/summary')
  deliverySummary(
    @Tenant() restaurantId: string,
    @Query() query: OptionalReportRangeDto,
  ) {
    return this.service.deliverySummary(
      restaurantId,
      parseDayRange(query.from, query.to),
    );
  }

  @Get('dashboard')
  dashboard(@Tenant() restaurantId: string) {
    return this.service.dashboard(restaurantId);
  }

  @Get('sales-by-day')
  salesByDay(
    @Tenant() restaurantId: string,
    @Query() query: OptionalReportRangeDto,
  ) {
    return this.service.salesByDay(
      restaurantId,
      parseDayRange(query.from, query.to),
    );
  }

  @Get('payment-methods')
  paymentMethods(
    @Tenant() restaurantId: string,
    @Query() query: OptionalReportRangeDto,
  ) {
    return this.service.salesByPaymentMethod(
      restaurantId,
      parseDayRange(query.from, query.to),
    );
  }

  @Get('top-products')
  topProducts(
    @Tenant() restaurantId: string,
    @Query() query: OptionalReportRangeDto,
  ) {
    return this.service.topProducts(
      restaurantId,
      parseDayRange(query.from, query.to),
    );
  }

  @Get('orders-by-status')
  ordersByStatus(
    @Tenant() restaurantId: string,
    @Query() query: OptionalReportRangeDto,
  ) {
    return this.service.ordersByStatus(
      restaurantId,
      parseDayRange(query.from, query.to),
    );
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
