import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

import { JwtAuthGuard } from './jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

import { UserRole } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =====================================
  // LOGIN ADMIN
  // =====================================

  @Public()
  @Post('admin-login')
  adminLogin(@Body() dto: LoginDto) {
    return this.authService.login(
      dto.slug,
      dto.email,
      dto.password,
      UserRole.ADMIN,
    );
  }

  // =====================================
  // LOGIN CAJERO
  // =====================================

  @Public()
  @Post('cashier-login')
  cashierLogin(@Body() dto: LoginDto) {
    return this.authService.login(
      dto.slug,
      dto.email,
      dto.password,
      UserRole.CASHIER,
    );
  }

  // =====================================
  // LOGIN MESERO
  // =====================================

  @Public()
  @Post('waiter-login')
  waiterLogin(@Body() dto: LoginDto) {
    return this.authService.login(
      dto.slug,
      dto.email,
      dto.password,
      UserRole.WAITER,
    );
  }

  // =====================================
  // LOGIN COCINA
  // =====================================

  @Public()
  @Post('kitchen-login')
  kitchenLogin(@Body() dto: LoginDto) {
    return this.authService.login(
      dto.slug,
      dto.email,
      dto.password,
      UserRole.KITCHEN,
    );
  }

  // =====================================
  // LOGIN DELIVERY
  // =====================================

  @Public()
  @Post('delivery-login')
  deliveryLogin(@Body() dto: LoginDto) {
    return this.authService.login(
      dto.slug,
      dto.email,
      dto.password,
      UserRole.DELIVERY,
    );
  }

  // =====================================
  // CREAR USUARIO
  // =====================================

  @Post('register-user')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles(UserRole.ADMIN)
  registerUser(@Body() dto: RegisterDto, @Req() req: any) {
    return this.authService.register(dto, req.user.restaurantId);
  }
}
