import { Currency } from '@/types';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CURRENCY_LOCALES: Record<Currency, string> = {
  TRY: 'tr-TR',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
};

/**
 * Formats a number as currency with proper locale and symbol
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'TRY',
  compact: boolean = false
): string {
  const locale = CURRENCY_LOCALES[currency];

  if (compact && Math.abs(amount) >= 1000000) {
    const millions = amount / 1000000;
    return `${CURRENCY_SYMBOLS[currency]}${millions.toFixed(1)}M`;
  }

  if (compact && Math.abs(amount) >= 1000) {
    const thousands = amount / 1000;
    return `${CURRENCY_SYMBOLS[currency]}${thousands.toFixed(1)}K`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Smart currency formatting - shows compact format for large numbers
 */
export function formatCurrencySmart(amount: number, currency: Currency = 'TRY'): string {
  if (Math.abs(amount) >= 1000000) {
    return formatCurrency(amount, currency, true);
  }
  return formatCurrency(amount, currency, false);
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'tr-TR'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a number as percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  locale: string = 'tr-TR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Gets currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency];
}

/**
 * Parses a formatted currency string back to number
 */
export function parseCurrency(formattedValue: string): number {
  // Remove all non-numeric characters except dots and commas
  const cleaned = formattedValue.replace(/[^\d,.-]/g, '');

  // Replace comma with dot for decimal parsing
  const normalized = cleaned.replace(',', '.');

  return parseFloat(normalized) || 0;
}
