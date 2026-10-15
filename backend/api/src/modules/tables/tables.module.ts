import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TablesController],
  providers: [TablesService, RolesGuard, TenantGuard],
})
export class TablesModule {}
