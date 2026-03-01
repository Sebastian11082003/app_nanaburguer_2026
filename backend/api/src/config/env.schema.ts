import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
});

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
