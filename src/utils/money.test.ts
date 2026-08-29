import { describe, expect, it } from 'vitest';

import { centsToDecimalString, parseCurrencyToCents, sumCents } from './money';

describe('parseCurrencyToCents', () => {
  it('parses a plain dollar amount', () => {
    expect(parseCurrencyToCents('$29.99')).toBe(2999);
  });

  it('parses a value with a currency symbol and surrounding spaces', () => {
    expect(parseCurrencyToCents('$ 5.99 ')).toBe(599);
  });

  it('parses a value using a comma as the thousands separator', () => {
    expect(parseCurrencyToCents('$1,029.50')).toBe(102950);
  });

  it('parses a value using a comma as the decimal separator', () => {
    expect(parseCurrencyToCents('29,99')).toBe(2999);
  });

  it('avoids floating point drift on repeated fractional values', () => {
    expect(parseCurrencyToCents('$0.10')).toBe(10);
    expect(parseCurrencyToCents('$0.20')).toBe(20);
  });

  it('throws when no numeric value can be extracted', () => {
    expect(() => parseCurrencyToCents('free')).toThrow();
  });
});

describe('sumCents', () => {
  it('sums a list of cent amounts without floating point drift', () => {
    expect(sumCents([1099, 599, 2999])).toBe(4697);
  });

  it('returns zero for an empty list', () => {
    expect(sumCents([])).toBe(0);
  });
});

describe('centsToDecimalString', () => {
  it('formats whole and fractional cents with two decimal places', () => {
    expect(centsToDecimalString(2999)).toBe('29.99');
    expect(centsToDecimalString(5)).toBe('0.05');
  });

  it('preserves the sign for negative amounts', () => {
    expect(centsToDecimalString(-150)).toBe('-1.50');
  });
});
