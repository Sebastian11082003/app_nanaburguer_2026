import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SalesController],
  providers: [SalesService, RolesGuard, TenantGuard],
  exports: [SalesService], // 🔥 IMPORTANTE para usar en Orders
})
export class SalesModule {}
