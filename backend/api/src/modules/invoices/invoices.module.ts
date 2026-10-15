import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { BILLING_PROVIDER } from './billing-provider';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { SimulatedBillingProvider } from './simulated-billing.provider';

import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [PrismaModule],
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    SimulatedBillingProvider,
    { provide: BILLING_PROVIDER, useExisting: SimulatedBillingProvider },
    RolesGuard,
    TenantGuard,
  ],
  exports: [InvoicesService],
})
export class InvoicesModule {}
