import { Module } from '@nestjs/common';
import { ConfigModule, type ConfigModuleOptions } from '@nestjs/config';
import { validateEnvForNest } from './config/env.schema';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './interfaces/health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';

const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  // Fuerza a que la firma sea EXACTAMENTE la que Nest tipa internamente
  validate: validateEnvForNest as ConfigModuleOptions['validate'],
};

@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
