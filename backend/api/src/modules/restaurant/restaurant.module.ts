import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';

import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, RolesGuard],
})
export class RestaurantModule {}
