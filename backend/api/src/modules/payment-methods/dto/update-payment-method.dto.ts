import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  label?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
