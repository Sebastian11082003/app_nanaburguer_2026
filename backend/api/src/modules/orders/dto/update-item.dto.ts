import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isComplimentary?: boolean;
}
