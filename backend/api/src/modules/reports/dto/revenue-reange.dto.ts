import { IsDateString } from 'class-validator';

export class RevenueRangeDto {
  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;
}
