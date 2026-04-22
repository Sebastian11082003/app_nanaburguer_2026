import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { RevenueRangeDto } from './dto/revenue-reange.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('summary')
  summary(@Tenant() restaurantId: string) {
    return this.service.summary(restaurantId);
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
