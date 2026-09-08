import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
