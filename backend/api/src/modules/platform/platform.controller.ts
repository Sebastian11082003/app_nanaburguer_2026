import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import { PlatformService } from './platform.service';

import { PlatformLoginDto } from './dto/platform-login.dto';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';

import { UpdateRestaurantStatusDto } from './dto/update-restaurant-status.dto';

import { PlatformJwtGuard } from './guards/platform-jwt.guard';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Post('login')
  login(@Body() dto: PlatformLoginDto) {
    return this.platformService.login(dto);
  }

  @UseGuards(PlatformJwtGuard)
  @Post('restaurants')
  createRestaurant(@Body() dto: CreateRestaurantDto) {
    return this.platformService.createRestaurant(dto);
  }

  @UseGuards(PlatformJwtGuard)
  @Get('restaurants')
  getRestaurants() {
    return this.platformService.getRestaurants();
  }

  @UseGuards(PlatformJwtGuard)
  @Patch('restaurants/:id')
  setRestaurantActive(
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantStatusDto,
  ) {
    return this.platformService.setRestaurantActive(id, dto.isActive);
  }

  @UseGuards(PlatformJwtGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
