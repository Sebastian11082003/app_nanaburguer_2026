import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserRole } from '@prisma/client';

import { RestaurantService } from './restaurant.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { logoUploadOptions } from './logo-upload.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';

/**
 * Self-service branding/settings for the CALLER's OWN restaurant.
 *
 * Deliberately has no `:id`-based routes: the previous version of this
 * controller let any ADMIN read/update/delete ANY restaurant by guessing
 * an id (no `TenantGuard`, no ownership check) — a cross-tenant data leak
 * in a genuinely multi-tenant product. Scoping everything to `/me` and
 * resolving the tenant from the JWT (via `@Tenant()`) makes that class of
 * bug structurally impossible here: there is no id to guess.
 */
@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles(UserRole.ADMIN)
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get('me')
  getOwn(@Tenant() restaurantId: string) {
    return this.restaurantService.findOwn(restaurantId);
  }

  @Patch('me')
  updateOwn(
    @Tenant() restaurantId: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantService.updateOwn(restaurantId, dto);
  }

  /**
   * Uploads a new logo image for the caller's own restaurant and persists
   * its public `/uploads/...` path as `logoUrl`. This is deliberately a
   * separate endpoint from `PATCH /me` (which takes JSON) because file
   * uploads need a `multipart/form-data` body — mixing the two would make
   * the DTO/validation story awkward for both cases.
   */
  @Post('me/logo')
  @UseInterceptors(FileInterceptor('file', logoUploadOptions))
  uploadLogo(
    @Tenant() restaurantId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }
    return this.restaurantService.updateLogo(restaurantId, `/uploads/logos/${file.filename}`);
  }
}
