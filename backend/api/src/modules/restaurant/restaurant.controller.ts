import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { RestaurantService } from './restaurant.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // =========================
  // FIND ALL
  // =========================
  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.restaurantService.findAll();
  }

  // =========================
  // FIND ONE
  // =========================
  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

  // =========================
  // UPDATE
  // =========================
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateRestaurantDto) {
    return this.restaurantService.update(id, dto);
  }

  // =========================
  // DELETE
  // =========================
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.restaurantService.remove(id);
  }
}
