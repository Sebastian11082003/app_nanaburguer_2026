import { Module, forwardRef } from '@nestjs/common';

import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [RolesController],
  providers: [RolesService, RolesGuard, PermissionsGuard, TenantGuard],
  exports: [RolesService],
})
export class RolesModule {}
