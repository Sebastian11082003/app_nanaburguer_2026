import { z } from 'zod';

/**
 * Values copied from docker/.env*.example. They are long enough to pass
 * the length check, so a public host can look "configured" while still
 * using a secret that lives in git. Local MVP is allowed to keep them
 * when ALLOW_INSECURE_DEFAULTS=true.
 */
export const INSECURE_JWT_SECRETS = [
  'change-me-local-mvp-only',
  'change-me-at-least-16-chars',
  'replace-with-long-random-secret',
] as const;

export function parseEnvFlag(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  if (value === true || value === 'true' || value === '1') {
    return true;
  }
  if (value === false || value === 'false' || value === '0') {
    return false;
  }
  return defaultValue;
}

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:3001')
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    ALLOW_INSECURE_DEFAULTS: z.unknown().optional(),
  })
  .superRefine((data, ctx) => {
    const allowInsecure = parseEnvFlag(
      data.ALLOW_INSECURE_DEFAULTS,
      data.NODE_ENV !== 'production',
    );

    if (
      !allowInsecure &&
      (INSECURE_JWT_SECRETS as readonly string[]).includes(data.JWT_SECRET)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message:
          'JWT_SECRET matches a documented example. Set a unique secret, or ALLOW_INSECURE_DEFAULTS=true for local only.',
      });
    }
  })
  .transform((data) => ({
    ...data,
    ALLOW_INSECURE_DEFAULTS: parseEnvFlag(
      data.ALLOW_INSECURE_DEFAULTS,
      data.NODE_ENV !== 'production',
    ),
  }));

export type EnvVars = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error(
      'Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    );
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export function validateEnvForNest(
  config: Record<string, any>,
): Record<string, any> {
  return validateEnv(config);
}
