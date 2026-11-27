import { describe, expect, it } from 'vitest';
import { parseServerEnv } from '../env';

const valid = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/toptop',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
};

describe('parseServerEnv', () => {
  it('returns the parsed variables when all are set', () => {
    expect(parseServerEnv(valid)).toEqual(valid);
  });

  it('throws and names the missing variable', () => {
    const withoutUrl: Record<string, string | undefined> = {
      ...valid,
      DATABASE_URL: undefined,
    };
    expect(() => parseServerEnv(withoutUrl)).toThrow(/DATABASE_URL/);
  });
});
