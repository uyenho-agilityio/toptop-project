import { hasLocale, useLocale } from 'next-intl';
import { DEFAULT_LOCALE, LOCALES } from '@/constants';
import {
  formatDate,
  formatMoney,
  formatMoneyCompact,
  formatNumber,
} from '@/utils';

type Amount = number | bigint;

/** The shared format helpers, bound to the active language. */
export const useFormat = () => {
  const active = useLocale();
  const locale = hasLocale(LOCALES, active) ? active : DEFAULT_LOCALE;

  return {
    formatMoney: (value: Amount) => formatMoney(value, locale),
    formatMoneyCompact: (value: Amount) => formatMoneyCompact(value, locale),
    formatNumber: (value: Amount, fractionDigits?: number) =>
      formatNumber(value, locale, fractionDigits),
    formatDate: (value: Date | string) => formatDate(value, locale),
  };
};
