import { Module } from '@nestjs/common';

import { CashController } from './cash.controller';
import { CashService } from './cash.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Module({
  controllers: [CashController],
  providers: [CashService, PrismaService],
})
export class CashModule {}
