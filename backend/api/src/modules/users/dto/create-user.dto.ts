import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  fullName!: string;

  /** Preferred: assign a Role row (system or custom). */
  @IsOptional()
  @IsUUID()
  roleId?: string;

  /** Legacy fallback when roleId is omitted. */
  @ValidateIf((o: CreateUserDto) => !o.roleId)
  @IsEnum(UserRole)
  role?: UserRole;
}
