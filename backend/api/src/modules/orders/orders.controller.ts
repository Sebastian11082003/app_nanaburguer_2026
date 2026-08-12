import {
  Body,
  Controller,
  Delete,
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
import { UpdateItemDto } from './dto/update-item.dto';
import { SetDiscountDto } from './dto/set-discount.dto';
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
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER, UserRole.DELIVERY)
  create(
    @Body() dto: CreateOrderDto,
    @Tenant() restaurantId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.ordersService.create(dto, restaurantId, req.user.userId);
  }

  // 🟢 AGREGAR ITEMS
  @Post(':id/items')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER, UserRole.DELIVERY)
  addItem(
    @Param('id') id: string,
    @Body() dto: AddItemDto,
    @Tenant() restaurantId: string,
  ) {
    return this.ordersService.addItem(id, dto, restaurantId);
  }

  // 🟢 EDITAR ITEM (cantidad/notas, solo mientras se arma el pedido)
  @Patch(':id/items/:itemId')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER, UserRole.DELIVERY)
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
    @Tenant() restaurantId: string,
  ) {
    return this.ordersService.updateItem(id, itemId, dto, restaurantId);
  }

  // 🟢 QUITAR ITEM (solo mientras se está armando el pedido)
  @Delete(':id/items/:itemId')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER, UserRole.DELIVERY)
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Tenant() restaurantId: string,
  ) {
    return this.ordersService.removeItem(id, itemId, restaurantId);
  }

  // 🟢 CAMBIAR ESTADO (cocina)
  @Patch(':id/status')
  @Roles(
    UserRole.ADMIN,
    UserRole.CASHIER,
    UserRole.WAITER,
    UserRole.KITCHEN,
    UserRole.DELIVERY,
  )
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Tenant() restaurantId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.ordersService.updateStatus(
      id,
      status,
      restaurantId,
      req.user.userId,
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

  // 🟢 DESCUENTO A NIVEL ORDEN
  @Patch(':id/discount')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  setDiscount(
    @Param('id') id: string,
    @Body() dto: SetDiscountDto,
    @Tenant() restaurantId: string,
  ) {
    return this.ordersService.setDiscount(
      id,
      dto.discountCents,
      restaurantId,
    );
  }

  // 🟢 CERRAR ORDEN (caja)
  @Patch(':id/close')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  closeOrder(
    @Param('id') id: string,
    @Tenant() restaurantId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.ordersService.closeOrder(id, restaurantId, req.user.userId);
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
