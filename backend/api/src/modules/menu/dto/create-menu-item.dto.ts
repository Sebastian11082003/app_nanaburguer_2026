import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateMenuItemDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  priceCents!: number;
}
