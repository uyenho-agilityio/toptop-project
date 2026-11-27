import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatMoney,
  formatMoneyCompact,
  formatNumber,
} from '../format';

describe('formatMoney', () => {
  it('writes VND with thousands separators for each language', () => {
    expect(formatMoney(1234567, 'vi')).toBe('1.234.567 ₫');
    expect(formatMoney(1234567, 'en')).toBe('1,234,567 ₫');
  });

  it('has no decimals and rounds to whole VND', () => {
    expect(formatMoney(999.5, 'en')).toBe('1,000 ₫');
    expect(formatMoney(999.4, 'vi')).toBe('999 ₫');
  });

  it('shows 0 and negative amounts', () => {
    expect(formatMoney(0, 'vi')).toBe('0 ₫');
    expect(formatMoney(-1500000, 'en')).toBe('−1,500,000 ₫');
  });

  it('keeps every digit of a very large amount', () => {
    expect(formatMoney(BigInt('9007199254740993'), 'en')).toBe(
      '9,007,199,254,740,993 ₫',
    );
    expect(formatMoney(1e21, 'vi')).toBe('1.000.000.000.000.000.000.000 ₫');
  });

  it('rejects a value that is not a finite number', () => {
    expect(() => formatMoney(Number.NaN, 'en')).toThrow(RangeError);
    expect(() => formatMoney(Number.POSITIVE_INFINITY, 'en')).toThrow(
      RangeError,
    );
  });
});

describe('formatMoneyCompact', () => {
  it('uses triệu and tỷ in Vietnamese', () => {
    expect(formatMoneyCompact(12_345_678, 'vi')).toBe('12,3 triệu');
    expect(formatMoneyCompact(1_250_000_000, 'vi')).toBe('1,25 tỷ');
  });

  it('uses M ₫ and B ₫ in English', () => {
    expect(formatMoneyCompact(12_345_678, 'en')).toBe('12.3M ₫');
    expect(formatMoneyCompact(1_250_000_000, 'en')).toBe('1.25B ₫');
  });

  it('writes amounts under a million in full', () => {
    expect(formatMoneyCompact(999_999, 'vi')).toBe('999.999 ₫');
    expect(formatMoneyCompact(0, 'en')).toBe('0 ₫');
  });

  it('keeps the sign of a negative amount', () => {
    expect(formatMoneyCompact(-2_500_000, 'en')).toBe('−2.5M ₫');
  });

  it('handles a very large amount', () => {
    expect(formatMoneyCompact(BigInt('9007199254740993'), 'en')).toBe(
      '9007199.25B ₫',
    );
  });
});

describe('formatNumber', () => {
  it('groups thousands for each language', () => {
    expect(formatNumber(1234567, 'vi')).toBe('1.234.567');
    expect(formatNumber(1234567, 'en')).toBe('1,234,567');
  });

  it('uses a decimal comma in Vietnamese and a decimal point in English', () => {
    expect(formatNumber(1234.5, 'vi', 2)).toBe('1.234,50');
    expect(formatNumber(1234.5, 'en', 2)).toBe('1,234.50');
  });

  it('shows 0 and negative numbers', () => {
    expect(formatNumber(0, 'en')).toBe('0');
    expect(formatNumber(-42, 'vi')).toBe('−42');
  });

  it('keeps every digit of a very large number', () => {
    expect(formatNumber(BigInt('9007199254740993'), 'vi')).toBe(
      '9.007.199.254.740.993',
    );
  });
});

describe('formatDate', () => {
  it('writes d/m/yyyy in Vietnamese and Mon d, yyyy in English', () => {
    expect(formatDate('2026-01-05', 'vi')).toBe('5/1/2026');
    expect(formatDate('2026-01-05', 'en')).toBe('Jan 5, 2026');
  });

  it('reads a moment in Vietnam time', () => {
    // 18:30 UTC on Nov 26 is 01:30 on Nov 27 in Vietnam (UTC+7).
    const moment = new Date('2026-11-26T18:30:00Z');
    expect(formatDate(moment, 'vi')).toBe('27/11/2026');
    expect(formatDate(moment, 'en')).toBe('Nov 27, 2026');
  });

  it('reads an ISO timestamp string in Vietnam time', () => {
    expect(formatDate('2026-12-31T17:00:00Z', 'en')).toBe('Jan 1, 2027');
  });

  it('rejects an invalid date', () => {
    expect(() => formatDate('not a date', 'en')).toThrow(RangeError);
    expect(() => formatDate('2026-02-30', 'en')).toThrow(RangeError);
    expect(() => formatDate(new Date(Number.NaN), 'vi')).toThrow(RangeError);
  });
});
