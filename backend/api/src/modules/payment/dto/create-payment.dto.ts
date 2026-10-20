import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsInt()
  amountCents!: number;

  @IsOptional()
  @IsInt()
  tipCents?: number;

  @IsOptional()
  currency?: string;

  // 🔥 SOLO PARA CASH
  @IsOptional()
  @IsInt()
  receivedCents?: number;
}
