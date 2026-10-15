import { Module } from '@nestjs/common';

import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService, RolesGuard, TenantGuard],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
