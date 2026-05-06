import { Module } from '@nestjs/common';
import { ConfigModule, type ConfigModuleOptions } from '@nestjs/config';
import { validateEnvForNest } from './config/env.schema';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './interfaces/health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TablesModule } from './modules/tables/tables.module';
import { PaymentsModule } from './modules/payment/payments.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ReportsModule } from './modules/reports/reports.module';
import { CashModule } from './modules/cashMovement/cash.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { SalesModule } from './modules/sales/sales.module';
import { MenuModule } from './modules/menu/menu.module';

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
    UsersModule,
    OrdersModule,
    TablesModule,
    PaymentsModule,
    InvoicesModule,
    ReportsModule,
    RestaurantModule,
    DeliveryModule,
    CashModule,
    SalesModule,
    ReportsModule,
    MenuModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
