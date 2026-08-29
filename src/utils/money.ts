export function parseCurrencyToCents(rawValue: string): number {
  const numericText = rawValue.replace(/[^0-9.,-]/g, '').trim();
  if (numericText.length === 0) {
    throw new Error(`Cannot parse a monetary value from "${rawValue}"`);
  }

  const normalized = normalizeDecimalSeparator(numericText);
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) {
    throw new Error(`Cannot parse a monetary value from "${rawValue}"`);
  }

  return Math.round(parsed * 100);
}

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function centsToDecimalString(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const absoluteCents = Math.abs(cents);
  const wholePart = Math.floor(absoluteCents / 100);
  const fractionPart = (absoluteCents % 100).toString().padStart(2, '0');
  return `${sign}${wholePart}.${fractionPart}`;
}

function normalizeDecimalSeparator(numericText: string): string {
  const lastComma = numericText.lastIndexOf(',');
  const lastDot = numericText.lastIndexOf('.');

  if (lastComma > lastDot) {
    return numericText.replace(/\./g, '').replace(',', '.');
  }

  return numericText.replace(/,/g, '');
}
