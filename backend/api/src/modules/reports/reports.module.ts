import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService, RolesGuard, TenantGuard],
})
export class ReportsModule {}
