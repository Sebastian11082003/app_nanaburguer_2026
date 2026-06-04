import { Body, Controller, Post } from '@nestjs/common';

import { RestaurantAuthService } from './restaurant-auth.service';
import { RestaurantLoginDto } from './dto/resttaurant-login.dto';

@Controller('restaurant-auth')
export class RestaurantAuthController {
  constructor(private readonly restaurantAuthService: RestaurantAuthService) {}

  @Post('login')
  login(@Body() dto: RestaurantLoginDto) {
    return this.restaurantAuthService.login(dto.slug, dto.email, dto.password);
  }
}
