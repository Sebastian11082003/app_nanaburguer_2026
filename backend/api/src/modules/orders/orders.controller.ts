import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersDto } from './dto/find-orders.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  create(
    @Body() dto: CreateOrderDto,
    @Tenant() restaurantId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.ordersService.create(dto, restaurantId, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  findAll(
    @Tenant() restaurantId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query() _query: FindOrdersDto,
  ) {
    return this.ordersService.findAll(restaurantId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  findOne(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.ordersService.findOne(id, restaurantId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Tenant() restaurantId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.ordersService.updateStatus(
      id,
      dto.status,
      restaurantId,
      req.user.id,
    );
  }
}
