import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @Roles(UserRole.ADMIN)
  @Permissions('ROLES_MANAGE')
  listPermissions() {
    return this.rolesService.listPermissions();
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @Permissions('ROLES_MANAGE')
  findAll(@Tenant() restaurantId: string) {
    return this.rolesService.findAll(restaurantId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @Permissions('ROLES_MANAGE')
  findOne(@Param('id') id: string, @Tenant() restaurantId: string) {
    return this.rolesService.findOne(id, restaurantId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @Permissions('ROLES_MANAGE')
  create(@Body() dto: CreateRoleDto, @Tenant() restaurantId: string) {
    return this.rolesService.create(dto, restaurantId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @Permissions('ROLES_MANAGE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Tenant() restaurantId: string,
  ) {
    return this.rolesService.update(id, restaurantId, dto);
  }
}
