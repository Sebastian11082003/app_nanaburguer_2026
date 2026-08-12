import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Fields a tenant's own ADMIN can self-manage for their restaurant —
 * primarily branding (`logoUrl`, `primaryColor`), which is what makes
 * this a true multi-tenant product: every restaurant sets its OWN look,
 * the platform never hardcodes any single customer's identity.
 */
export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  /**
   * URL/path to the restaurant's own logo. Not validated as a strict
   * `@IsUrl()` because tenants may point at a relative `/uploads/...`
   * path served by this same app, not just an absolute URL.
   */
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;
}
