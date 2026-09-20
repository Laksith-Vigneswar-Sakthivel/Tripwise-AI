/**
 * Formatting utilities for TripWise AI
 */

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return `${CURRENCY_SYMBOLS[currency] || '₹'}0`;
  }
  const numeric = Math.round(Number(amount));
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';

  if (currency === 'INR') {
    return `${symbol}${numeric.toLocaleString('en-IN')}`;
  }
  return `${symbol}${numeric.toLocaleString('en-US')}`;
};

export const formatDate = (dateInput) => {
  if (!dateInput) return 'Today';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
};

export const formatShortDate = (dateInput) => {
  if (!dateInput) return 'Today';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return String(dateInput);
  }
};

export const formatPercent = (val, includeSign = false) => {
  const num = Number(val) || 0;
  const formatted = `${Math.abs(num).toFixed(1)}%`;
  if (includeSign) {
    return num > 0 ? `+${formatted}` : num < 0 ? `-${formatted}` : formatted;
  }
  return formatted;
};
