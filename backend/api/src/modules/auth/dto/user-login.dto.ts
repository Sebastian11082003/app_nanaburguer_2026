import { IsEmail, IsString } from 'class-validator';

export class UserLoginDto {
  @IsString()
  slug!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
