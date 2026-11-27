import { APP_TIME_ZONE } from '@/constants';
import type { Locale } from '@/types';

/** Money is integer VND (spec Q-ENG-7). A bigint keeps every digit of an amount above 2^53. */
type Amount = number | bigint;

const MINUS = '−';
const SEPARATORS: Record<Locale, { group: string; decimal: string }> = {
  en: { group: ',', decimal: '.' },
  vi: { group: '.', decimal: ',' },
};
const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const PLAIN_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const assertFinite = (value: Amount) => {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new RangeError(`Cannot format a non-finite number: ${value}`);
  }
};

const isNegative = (value: Amount) => value < 0;

const absolute = (value: Amount) =>
  typeof value === 'bigint' ? (value < 0 ? -value : value) : Math.abs(value);

/**
 * Writes the absolute value with the language's marks, never in exponent notation.
 * Rounds half away from zero to `fractionDigits`.
 */
const writeDigits = (
  value: Amount,
  locale: Locale,
  fractionDigits: number,
  grouped: boolean,
) => {
  const { group, decimal } = SEPARATORS[locale];
  const [integer, fraction] = new Intl.NumberFormat('en-US', {
    useGrouping: false,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
    .format(absolute(value))
    .split('.');
  const head = grouped
    ? integer.replace(/\B(?=(\d{3})+(?!\d))/g, group)
    : integer;
  return fraction ? `${head}${decimal}${fraction}` : head;
};

/** Adds the minus sign, unless the value rounds to zero. */
const withSign = (value: Amount, text: string) =>
  isNegative(value) && /[1-9]/.test(text) ? `${MINUS}${text}` : text;

/** A number with thousands separators and the language's decimal mark. */
export const formatNumber = (
  value: Amount,
  locale: Locale,
  fractionDigits = 0,
) => {
  assertFinite(value);
  return withSign(value, writeDigits(value, locale, fractionDigits, true));
};

/** A full VND amount, rounded to whole VND: `1.234.567 ₫` (vi), `1,234,567 ₫` (en). */
export const formatMoney = (value: Amount, locale: Locale) =>
  `${formatNumber(value, locale)} ₫`;

/**
 * A short VND amount for cards (spec Q-FND-4), as in the Prototype `money()`:
 * `12,3 triệu` and `1,25 tỷ` (vi), `12.3M ₫` and `1.25B ₫` (en).
 * Amounts under a million are written in full.
 */
export const formatMoneyCompact = (value: Amount, locale: Locale) => {
  assertFinite(value);
  const size = Number(absolute(value));
  const short = (divisor: number, fractionDigits: number) =>
    withSign(value, writeDigits(size / divisor, locale, fractionDigits, false));

  if (size >= 1e9) {
    return `${short(1e9, 2)}${locale === 'vi' ? ' tỷ' : 'B ₫'}`;
  }
  if (size >= 1e6) {
    return `${short(1e6, 1)}${locale === 'vi' ? ' triệu' : 'M ₫'}`;
  }
  return formatMoney(value, locale);
};

/** Year, month and day of a moment in Vietnam time (spec Q-FND-5). */
const vietnamDay = (moment: Date) => {
  if (Number.isNaN(moment.getTime())) {
    throw new RangeError('Cannot format an invalid date');
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(moment);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(item => item.type === type)?.value);
  return { year: part('year'), month: part('month'), day: part('day') };
};

/** Year, month and day of a `yyyy-mm-dd` string, which must be a real calendar day. */
const calendarDay = ([text, y, m, d]: RegExpExecArray) => {
  const [year, month, day] = [Number(y), Number(m), Number(d)];
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new RangeError(`Cannot format an invalid date: ${text}`);
  }
  return { year, month, day };
};

/**
 * A date as `d/m/yyyy` (vi) or `Mon d, yyyy` (en).
 * A `yyyy-mm-dd` string is a calendar day and is not shifted.
 * A `Date` or an ISO timestamp is read in Vietnam time.
 */
export const formatDate = (value: Date | string, locale: Locale) => {
  const plain = typeof value === 'string' ? PLAIN_DATE.exec(value) : null;
  const { year, month, day } = plain
    ? calendarDay(plain)
    : vietnamDay(typeof value === 'string' ? new Date(value) : value);

  return locale === 'vi'
    ? `${day}/${month}/${year}`
    : `${MONTHS_EN[month - 1]} ${day}, ${year}`;
};
