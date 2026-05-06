import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterRestaurantDto {
  @IsString()
  name!: string;

  @IsString()
  nit!: string;

  @IsString()
  phone!: string;

  @IsString()
  address!: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  @MinLength(6)
  adminPassword!: string;

  @IsString()
  @MinLength(3)
  adminName!: string;
}
