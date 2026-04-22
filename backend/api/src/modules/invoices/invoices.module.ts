import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [PrismaModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, RolesGuard, TenantGuard],
  exports: [InvoicesService],
})
export class InvoicesModule {}
