import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { CashService } from './cash.service';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

import { UserRole } from '@prisma/client';

@Controller('cash')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class CashController {
  constructor(private readonly service: CashService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  create(
    @Body() dto: CreateCashMovementDto,
    @Tenant() restaurantId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.service.create(dto, restaurantId, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findAll(@Tenant() restaurantId: string) {
    return this.service.findAll(restaurantId);
  }
}
