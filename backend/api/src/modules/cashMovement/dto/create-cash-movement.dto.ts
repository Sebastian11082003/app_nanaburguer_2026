import { IsEnum, IsInt, IsString } from 'class-validator';
import { CashType } from '@prisma/client';

export class CreateCashMovementDto {
  @IsEnum(CashType)
  type!: CashType;

  @IsString()
  concept!: string;

  @IsInt()
  amountCents!: number;

  @IsString()
  reference?: string;
}
