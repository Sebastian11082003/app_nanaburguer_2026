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

import { OrderStatus, UserRole } from '@prisma/client';

import { OrdersService } from './orders.service';

import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersDto } from './dto/find-orders.dto';
import { AddItemDto } from './dto/add-item.dto';
import { TransferTableDto } from './dto/transfer-table.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 🟢 CREAR ORDEN (vacía)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  create(
    @Body() dto: CreateOrderDto,
    @Tenant() restaurantId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.ordersService.create(dto, restaurantId, req.user.id);
  }

  // 🟢 AGREGAR ITEMS
  @Post(':id/items')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  addItem(
    @Param('id') id: string,
    @Body() dto: AddItemDto,
    @Tenant() restaurantId: string,
  ) {
    return this.ordersService.addItem(id, dto, restaurantId);
  }

  // 🟢 CAMBIAR ESTADO (cocina)
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Tenant() restaurantId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.ordersService.updateStatus(
      id,
      status,
      restaurantId,
      req.user.id,
    );
  }

  // 🟢 TRANSFERIR MESA
  @Patch(':id/transfer')
  @Roles(UserRole.ADMIN, UserRole.WAITER)
  transferTable(
    @Param('id') id: string,
    @Body() dto: TransferTableDto,
    @Tenant() restaurantId: string,
  ) {
    return this.ordersService.transferTable(id, dto, restaurantId);
  }

  // 🟢 CERRAR ORDEN (caja)
  @Patch(':id/close')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  closeOrder(
    @Param('id') id: string,
    @Tenant() restaurantId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.ordersService.closeOrder(id, restaurantId, req.user.id);
  }

  // 🟢 LISTAR
  @Get()
  findAll(@Tenant() restaurantId: string, @Query() query: FindOrdersDto) {
    return this.ordersService.findAll(restaurantId, query);
  }

  // 🟢 DETALLE
  @Get(':id')
  findOne(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.ordersService.findOne(id, restaurantId);
  }
}
