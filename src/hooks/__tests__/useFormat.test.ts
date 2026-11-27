import { renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { createElement, type ComponentProps, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { useFormat } from '../useFormat';

const wrapperFor = (locale: string) => {
  const IntlWrapper = ({ children }: { children: ReactNode }) => {
    const props: ComponentProps<typeof NextIntlClientProvider> = {
      locale,
      messages: {},
      children,
    };
    return createElement(NextIntlClientProvider, props);
  };
  return IntlWrapper;
};

describe('useFormat', () => {
  it('follows the active language: Vietnamese', () => {
    const { result } = renderHook(() => useFormat(), {
      wrapper: wrapperFor('vi'),
    });

    expect(result.current.formatMoney(1234567)).toBe('1.234.567 ₫');
    expect(result.current.formatMoneyCompact(1_250_000_000)).toBe('1,25 tỷ');
    expect(result.current.formatNumber(1234.5, 1)).toBe('1.234,5');
    expect(result.current.formatDate('2026-01-05')).toBe('5/1/2026');
  });

  it('follows the active language: English', () => {
    const { result } = renderHook(() => useFormat(), {
      wrapper: wrapperFor('en'),
    });

    expect(result.current.formatMoney(1234567)).toBe('1,234,567 ₫');
    expect(result.current.formatMoneyCompact(1_250_000_000)).toBe('1.25B ₫');
    expect(result.current.formatNumber(1234.5, 1)).toBe('1,234.5');
    expect(result.current.formatDate('2026-01-05')).toBe('Jan 5, 2026');
  });
});
