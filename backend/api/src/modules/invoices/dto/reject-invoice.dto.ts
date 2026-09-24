import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectInvoiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
