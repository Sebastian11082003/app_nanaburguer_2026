import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [PrismaModule, AuthModule, PaymentMethodsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, RolesGuard, TenantGuard],
})
export class PaymentsModule {}
