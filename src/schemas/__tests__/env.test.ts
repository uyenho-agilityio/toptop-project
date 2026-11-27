import { describe, expect, it } from 'vitest';
import { serverEnvSchema } from '../env';

const valid = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/toptop',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
};

describe('serverEnvSchema', () => {
  it('accepts a complete environment', () => {
    expect(serverEnvSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an auth secret shorter than 32 characters', () => {
    expect(
      serverEnvSchema.safeParse({ ...valid, BETTER_AUTH_SECRET: 'short' })
        .success,
    ).toBe(false);
  });

  it('rejects a base URL that is not a URL', () => {
    expect(
      serverEnvSchema.safeParse({ ...valid, BETTER_AUTH_URL: 'localhost' })
        .success,
    ).toBe(false);
  });
});
