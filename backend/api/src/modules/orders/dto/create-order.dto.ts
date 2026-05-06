import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderType, OrderSource } from '@prisma/client';

export class CreateOrderDto {
  @IsEnum(OrderType)
  type!: OrderType;

  @IsOptional()
  @IsString()
  tableId?: string;

  // 🔥 DELIVERY / PICKUP (solo si aplica)
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  // 🔥 ORIGEN
  @IsEnum(OrderSource)
  source!: OrderSource;
}
