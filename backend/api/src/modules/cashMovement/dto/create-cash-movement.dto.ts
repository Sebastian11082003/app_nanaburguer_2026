import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CashType } from '@prisma/client';

export class CreateCashMovementDto {
  @IsEnum(CashType)
  type!: CashType;

  @IsString()
  concept!: string;

  @IsInt()
  @Min(1)
  amountCents!: number;

  @IsOptional()
  @IsString()
  reference?: string;
}
