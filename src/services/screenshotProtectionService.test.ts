import { describe, expect, it } from 'vitest';

import { isLikelyProtectedScreenshot } from './screenshotProtectionService';

describe('isLikelyProtectedScreenshot', () => {
  it('treats a tiny, uniformly compressed screenshot as likely protected', () => {
    const tinyPng = Buffer.alloc(500, 0).toString('base64');
    expect(isLikelyProtectedScreenshot(tinyPng)).toBe(true);
  });

  it('treats a normally sized screenshot as not protected', () => {
    const normalPng = Buffer.alloc(50_000, 128).toString('base64');
    expect(isLikelyProtectedScreenshot(normalPng)).toBe(false);
  });
});
