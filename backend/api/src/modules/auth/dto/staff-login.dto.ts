import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/** Unified staff login — same screen for waiter, cashier, delivery, kitchen, admin. */
export class StaffLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  /** When set, the email must belong to this tenant (slug identification). */
  @IsOptional()
  @IsString()
  slug?: string;
}
