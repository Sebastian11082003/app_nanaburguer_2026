import { IsEnum, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderStatus, OrderType } from '@prisma/client';

export class FindOrdersDto {
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  activeOnly?: boolean;

  // 🔥 NUEVO → clave para cocina
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  kitchenView?: boolean;
}
