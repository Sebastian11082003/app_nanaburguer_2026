import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { InvoicesService } from './invoices.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  findAll(@Tenant() restaurantId: string) {
    return this.service.findAll(restaurantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.findOne(id, restaurantId);
  }

  // 🔥 ESTE ES EL IMPORTANTE
  @Get(':id/print')
  print(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.print(id, restaurantId);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.markAccepted(id, restaurantId);
  }
}
