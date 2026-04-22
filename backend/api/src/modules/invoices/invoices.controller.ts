import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto, @Tenant() restaurantId: string) {
    return this.service.create(dto, restaurantId);
  }

  @Get()
  findAll(@Tenant() restaurantId: string) {
    return this.service.findAll(restaurantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.findOne(id, restaurantId);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.markAccepted(id, restaurantId);
  }
}
