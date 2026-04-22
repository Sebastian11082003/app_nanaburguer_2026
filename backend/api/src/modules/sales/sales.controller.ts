import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { SalesService } from './sales.service';
import { FindSalesDto } from './dto/find-sales.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findAll(@Tenant() restaurantId: string, @Query() query: FindSalesDto) {
    return this.salesService.findAll(restaurantId, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findOne(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.salesService.findOne(id, restaurantId);
  }
}
