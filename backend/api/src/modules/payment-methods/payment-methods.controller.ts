import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  /**
   * Lists tenant payment methods. Pass `?activeOnly=true` for the pay UI
   * (cashiers/waiters/admins charging an order).
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  findAll(
    @Tenant() restaurantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const onlyActive =
      activeOnly === 'true' || activeOnly === '1' || activeOnly === 'yes';
    return this.paymentMethodsService.findAll(restaurantId, onlyActive);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
    @Tenant() restaurantId: string,
  ) {
    return this.paymentMethodsService.update(id, restaurantId, dto);
  }
}
