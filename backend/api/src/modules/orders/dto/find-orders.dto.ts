import { IsEnum, IsOptional, IsUUID, IsBoolean } from 'class-validator';
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
  @IsBoolean()
  activeOnly?: boolean;
}
