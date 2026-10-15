import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class FindUsersDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
