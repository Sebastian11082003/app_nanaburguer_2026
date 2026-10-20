import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { RestaurantAuthService } from './restaurant-auth.service';
import { RestaurantLoginDto } from './dto/resttaurant-login.dto';

@Controller('restaurant-auth')
export class RestaurantAuthController {
  constructor(private readonly restaurantAuthService: RestaurantAuthService) {}

  @Post('login')
  login(@Body() dto: RestaurantLoginDto) {
    return this.restaurantAuthService.login(dto.slug, dto.email, dto.password);
  }

  /**
   * Public, unauthenticated lookup of a restaurant's NAME + LOGO ONLY by
   * slug. Deliberately intentional: it lets the `/restaurant/login` screen
   * show the tenant's own branding (like a "profile picture") as soon as
   * they type their slug, before they've entered a password — this must
   * NEVER return anything more sensitive (email, nit, phone, etc).
   */
  @Get('branding')
  getBranding(@Query('slug') slug?: string) {
    return this.restaurantAuthService.getBranding(slug);
  }
}
