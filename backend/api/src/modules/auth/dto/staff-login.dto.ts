import { IsEmail, IsString, MinLength } from 'class-validator';

/** Unified staff login — same screen for waiter, cashier, delivery, kitchen, admin. */
export class StaffLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
