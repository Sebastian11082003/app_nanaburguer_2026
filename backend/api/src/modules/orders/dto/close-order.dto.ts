import { IsEnum } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CloseOrderDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
