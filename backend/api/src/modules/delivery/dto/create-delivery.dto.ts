import { PaymentMethod } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator/types/decorator/decorators';

export class CreateDeliveryDto {
  @IsString()
  customerName!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  // 🔥 NUEVO
  @IsOptional()
  @IsInt()
  deliveryFeeCents?: number;
}
