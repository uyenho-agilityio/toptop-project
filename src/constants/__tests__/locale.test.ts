import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALES } from '../locale';

describe('locale constants', () => {
  it('has exactly English and Vietnamese, with English as the default', () => {
    expect(LOCALES).toEqual(['en', 'vi']);
    expect(DEFAULT_LOCALE).toBe('en');
  });
});
