import { describe, expect, it } from 'vitest';
import { businessScopeSchema } from '../business-scope';

describe('businessScopeSchema', () => {
  it('accepts a Business id and a user id', () => {
    expect(
      businessScopeSchema.safeParse({ businessId: 'biz-a', userId: 'user-a' })
        .success,
    ).toBe(true);
  });

  it('rejects a scope with no Business id', () => {
    expect(businessScopeSchema.safeParse({ userId: 'user-a' }).success).toBe(
      false,
    );
    expect(
      businessScopeSchema.safeParse({ businessId: '', userId: 'user-a' })
        .success,
    ).toBe(false);
  });

  it('rejects a scope with no user id', () => {
    expect(
      businessScopeSchema.safeParse({ businessId: 'biz-a', userId: ' ' })
        .success,
    ).toBe(false);
  });

  it('drops unknown fields', () => {
    const result = businessScopeSchema.parse({
      businessId: 'biz-a',
      userId: 'user-a',
      role: 'admin',
    });

    expect(result).toEqual({ businessId: 'biz-a', userId: 'user-a' });
  });
});
