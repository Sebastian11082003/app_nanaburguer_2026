import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersDto } from './dto/find-orders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  create(@Body() dto: CreateOrderDto, @Req() req: { user: { id: string } }) {
    return this.ordersService.create(dto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  findAll(@Query() query: FindOrdersDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.ordersService.updateStatus(id, dto.status, req.user.id);
  }
}
