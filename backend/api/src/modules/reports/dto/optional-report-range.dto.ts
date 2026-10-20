import { IsDateString, IsOptional } from 'class-validator';

export class OptionalReportRangeDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
