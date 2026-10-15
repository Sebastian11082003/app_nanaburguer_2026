import {
  INSECURE_JWT_SECRETS,
  parseEnvFlag,
  validateEnv,
} from './env.schema';

const valid = {
  DATABASE_URL: 'postgresql://nanaburguer:nanaburguer@localhost:5432/nanaburguer_dev',
  JWT_SECRET: 'a-unique-secret-not-in-git',
};

describe('parseEnvFlag', () => {
  it('uses the default when the value is missing', () => {
    expect(parseEnvFlag(undefined, true)).toBe(true);
    expect(parseEnvFlag('', false)).toBe(false);
  });

  it('accepts true/false strings used by Compose', () => {
    expect(parseEnvFlag('true', false)).toBe(true);
    expect(parseEnvFlag('false', true)).toBe(false);
    expect(parseEnvFlag('1', false)).toBe(true);
    expect(parseEnvFlag('0', true)).toBe(false);
  });
});

describe('validateEnv', () => {
  it('allows documented JWT examples in development (local npm start)', () => {
    const env = validateEnv({
      ...valid,
      NODE_ENV: 'development',
      JWT_SECRET: INSECURE_JWT_SECRETS[0],
    });

    expect(env.ALLOW_INSECURE_DEFAULTS).toBe(true);
    expect(env.JWT_SECRET).toBe(INSECURE_JWT_SECRETS[0]);
  });

  it('rejects documented JWT examples in production unless opted in', () => {
    for (const jwt of INSECURE_JWT_SECRETS) {
      expect(() =>
        validateEnv({
          ...valid,
          NODE_ENV: 'production',
          JWT_SECRET: jwt,
        }),
      ).toThrow('Invalid environment variables');
    }
  });

  it('allows a documented JWT example in production only with ALLOW_INSECURE_DEFAULTS', () => {
    const env = validateEnv({
      ...valid,
      NODE_ENV: 'production',
      JWT_SECRET: INSECURE_JWT_SECRETS[0],
      ALLOW_INSECURE_DEFAULTS: 'true',
    });

    expect(env.ALLOW_INSECURE_DEFAULTS).toBe(true);
  });

  it('allows a unique JWT in production without the opt-in flag', () => {
    const env = validateEnv({
      ...valid,
      NODE_ENV: 'production',
    });

    expect(env.ALLOW_INSECURE_DEFAULTS).toBe(false);
    expect(env.JWT_SECRET).toBe(valid.JWT_SECRET);
  });

  it('still splits CORS_ORIGINS on commas', () => {
    const env = validateEnv({
      ...valid,
      CORS_ORIGINS: 'https://app.example.com, https://admin.example.com',
    });

    expect(env.CORS_ORIGINS).toEqual([
      'https://app.example.com',
      'https://admin.example.com',
    ]);
  });
});
