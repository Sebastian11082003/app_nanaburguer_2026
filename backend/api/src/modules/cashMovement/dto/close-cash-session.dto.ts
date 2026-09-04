import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CloseCashSessionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  countedCents?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
