import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class OpenCashSessionDto {
  @IsInt()
  @Min(0)
  openingCents!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
