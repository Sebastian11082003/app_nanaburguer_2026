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

import { CategoryService } from './category.service';
import { MenuItemService } from './menu-item.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class MenuController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly menuItemService: MenuItemService,
  ) {}

  // CATEGORY

  @Post('categories')
  @Roles(UserRole.ADMIN)
  createCategory(
    @Body() dto: CreateCategoryDto,
    @Tenant() restaurantId: string,
  ) {
    return this.categoryService.create(dto, restaurantId);
  }

  @Get('categories')
  findCategories(@Tenant() restaurantId: string) {
    return this.categoryService.findAll(restaurantId);
  }

  @Patch('categories/:id')
  @Roles(UserRole.ADMIN)
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Tenant() restaurantId: string,
  ) {
    return this.categoryService.update(id, dto, restaurantId);
  }

  // MENU ITEMS

  @Post('items')
  @Roles(UserRole.ADMIN)
  createItem(@Body() dto: CreateMenuItemDto, @Tenant() restaurantId: string) {
    return this.menuItemService.create(dto, restaurantId);
  }

  @Get('items')
  findItems(@Tenant() restaurantId: string) {
    return this.menuItemService.findAll(restaurantId);
  }

  @Patch('items/:id')
  @Roles(UserRole.ADMIN)
  updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
    @Tenant() restaurantId: string,
  ) {
    return this.menuItemService.update(id, dto, restaurantId);
  }
}
