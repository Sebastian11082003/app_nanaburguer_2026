import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class FindPaymentsDto {
  @IsOptional()
  @IsUUID()
  saleId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsUUID()
  createdById?: string;
}
