import { IsDateString, IsOptional, ValidateIf } from 'class-validator';

export class UpdatePickupAtDto {
  /** ISO datetime, or empty/null to clear. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsDateString()
  pickupAt?: string | null;
}
