import { describe, expect, it } from 'vitest';

import { normalizeWhitespace } from './text';

describe('normalizeWhitespace', () => {
  it('collapses repeated internal whitespace to a single space', () => {
    expect(normalizeWhitespace('Sauce   Labs\nBackpack')).toBe('Sauce Labs Backpack');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeWhitespace('  Products  ')).toBe('Products');
  });
});
