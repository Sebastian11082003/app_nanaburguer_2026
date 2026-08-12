import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @Permissions('USERS_MANAGE')
  create(@Body() dto: CreateUserDto, @Tenant() restaurantId: string) {
    return this.usersService.create(dto, restaurantId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @Permissions('USERS_MANAGE')
  findAll(@Tenant() restaurantId: string, @Query() query: FindUsersDto) {
    return this.usersService.findAll(restaurantId, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @Permissions('USERS_MANAGE')
  findOne(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.usersService.findOne(id, restaurantId);
  }
}
