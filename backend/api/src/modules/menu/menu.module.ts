import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { MenuController } from './menu.controller';
import { CategoryService } from './category.service';
import { MenuItemService } from './menu-item.service';

import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MenuController],
  providers: [CategoryService, MenuItemService, RolesGuard, TenantGuard],
})
export class MenuModule {}
