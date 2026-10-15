import { IsInt, IsUUID, Min, IsOptional, IsString } from 'class-validator';

export class AddItemDto {
  @IsUUID()
  menuItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
