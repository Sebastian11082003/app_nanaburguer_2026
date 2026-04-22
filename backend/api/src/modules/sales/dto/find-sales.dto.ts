import { IsOptional, IsUUID } from 'class-validator';

export class FindSalesDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;
}
