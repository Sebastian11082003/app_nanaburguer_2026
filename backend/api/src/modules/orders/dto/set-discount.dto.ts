import { IsInt, Min } from 'class-validator';

export class SetDiscountDto {
  @IsInt()
  @Min(0)
  discountCents!: number;
}
