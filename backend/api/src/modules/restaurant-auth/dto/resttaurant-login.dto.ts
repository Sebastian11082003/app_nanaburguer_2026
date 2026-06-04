import { IsEmail, IsString, MinLength } from 'class-validator';

export class RestaurantLoginDto {
  @IsString()
  slug!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
