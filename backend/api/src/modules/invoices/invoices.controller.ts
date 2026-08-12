import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { InvoicesService } from './invoices.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';

/**
 * Invoices are financial/legal documents, so every route here is
 * restricted to ADMIN/CASHIER — WAITER/KITCHEN/DELIVERY have no business
 * reason to read or accept them. (Previously this controller had no
 * `@Roles` at all, meaning any authenticated tenant user could list every
 * invoice's contents — this closes that gap.)
 */
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles(UserRole.ADMIN, UserRole.CASHIER)
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

  /** Returns the printable receipt snapshot (see `PaymentsService.buildInvoice`). */
  @Get(':id/print')
  print(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.print(id, restaurantId);
  }

  /** Simulates DIAN acceptance (no real e-invoicing integration yet). */
  @Post(':id/accept')
  accept(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.markAccepted(id, restaurantId);
  }
}
