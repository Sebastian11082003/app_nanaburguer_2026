import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FindPaymentsDto } from './dto/find-payment.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':saleId/payments')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  create(
    @Param('saleId') saleId: string,
    @Body() dto: CreatePaymentDto,
    @Tenant() restaurantId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.paymentsService.create(saleId, dto, restaurantId, req.user.id);
  }

  @Get(':saleId/payments')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  findAll(
    @Param('saleId') saleId: string,
    @Tenant() restaurantId: string,
    @Query() query: FindPaymentsDto,
  ) {
    return this.paymentsService.findAll(restaurantId, {
      ...query,
      saleId,
    });
  }

  @Get(':saleId/payments/:id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  findOne(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.paymentsService.findOne(id, restaurantId);
  }
}
