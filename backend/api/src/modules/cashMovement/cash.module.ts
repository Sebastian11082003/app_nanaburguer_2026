import { Module } from '@nestjs/common';

import { CashController } from './cash.controller';
import { CashService } from './cash.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  controllers: [CashController],
  providers: [
    CashService,
    PrismaService,
    RolesGuard,
    PermissionsGuard,
    TenantGuard,
  ],
})
export class CashModule {}
