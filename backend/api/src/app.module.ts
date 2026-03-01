import { Module } from '@nestjs/common';
import { ConfigModule, type ConfigModuleOptions } from '@nestjs/config';
import { validateEnvForNest } from './config/env.schema';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './interfaces/health/health.controller';

const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  // Fuerza a que la firma sea EXACTAMENTE la que Nest tipa internamente
  validate: validateEnvForNest as ConfigModuleOptions['validate'],
};

@Module({
  imports: [ConfigModule.forRoot(configOptions), PrismaModule],
  controllers: [HealthController],
})
export class AppModule {}
