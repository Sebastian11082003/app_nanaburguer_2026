import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';

import { DeliveryService } from './delivery.service';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';

import { UserRole } from '@prisma/client';

@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  // ============================
  // 🔎 LIST ALL
  // ============================
  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.DELIVERY)
  findAll(@Tenant() restaurantId: string) {
    return this.service.findAll(restaurantId);
  }

  // ============================
  // 🔎 FIND ONE
  // ============================
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.DELIVERY)
  findOne(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.findOne(id, restaurantId);
  }

  // ============================
  // 🖨️ PRINTED
  // ============================
  @Patch(':id/printed')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  markPrinted(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.markPrinted(id, restaurantId);
  }

  // ============================
  // 🚚 DISPATCH
  // ============================
  @Patch(':id/dispatch')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  dispatch(
    @Param('id') id: string,
    @Tenant() restaurantId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.service.dispatch(id, restaurantId, req.user.userId);
  }

  // ============================
  // ✅ DELIVERED
  // ============================
  @Patch(':id/deliver')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.DELIVERY)
  deliver(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.deliver(id, restaurantId);
  }

  // ============================
  // 🔄 UPDATE STATUS (fallback)
  // ============================
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryStatusDto,
    @Tenant() restaurantId: string,
  ) {
    return this.service.updateStatus(id, dto.status, restaurantId);
  }
}
