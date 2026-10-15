import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  nit!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  // RESTAURANT LOGIN

  @IsEmail()
  restaurantEmail!: string;

  @IsString()
  @MinLength(6)
  restaurantPassword!: string;

  // ADMIN

  @IsString()
  @MinLength(3)
  adminName!: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  @MinLength(6)
  adminPassword!: string;
}
