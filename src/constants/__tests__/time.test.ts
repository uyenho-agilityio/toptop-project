import { describe, expect, it } from 'vitest';
import { APP_TIME_ZONE } from '../time';

describe('time constants', () => {
  it('uses fixed Vietnam time', () => {
    expect(APP_TIME_ZONE).toBe('Asia/Ho_Chi_Minh');
  });
});
