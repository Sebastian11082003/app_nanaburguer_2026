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

import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CashService } from './cash.service';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import { OpenCashSessionDto } from './dto/open-cash-session.dto';

@Controller('cash')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
@Roles(UserRole.ADMIN, UserRole.CASHIER)
@Permissions('CASH_MANAGE')
export class CashController {
  constructor(private readonly service: CashService) {}

  @Post()
  create(
    @Body() dto: CreateCashMovementDto,
    @Tenant() restaurantId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.service.create(dto, restaurantId, req.user.userId);
  }

  @Get()
  findAll(
    @Tenant() restaurantId: string,
    @Query('from') from?: string,
  ) {
    return this.service.findAll(
      restaurantId,
      from ? new Date(from) : undefined,
    );
  }

  @Get('sessions')
  listSessions(@Tenant() restaurantId: string) {
    return this.service.listSessions(restaurantId);
  }

  @Get('sessions/current')
  currentSession(@Tenant() restaurantId: string) {
    return this.service.currentSession(restaurantId);
  }

  @Get('sessions/:id')
  findSession(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.service.findSession(id, restaurantId);
  }

  @Post('sessions')
  openSession(
    @Body() dto: OpenCashSessionDto,
    @Tenant() restaurantId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.service.openSession(dto, restaurantId, req.user.userId);
  }

  @Post('sessions/:id/close')
  closeSession(
    @Param('id') id: string,
    @Body() dto: CloseCashSessionDto,
    @Tenant() restaurantId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.service.closeSession(id, dto, restaurantId, req.user.userId);
  }
}
