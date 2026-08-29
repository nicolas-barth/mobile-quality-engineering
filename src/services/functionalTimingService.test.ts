import { describe, expect, it } from 'vitest';

import { measureOperation } from './functionalTimingService';

describe('measureOperation', () => {
  it('labels the timing with the given operation name', async () => {
    const timing = await measureOperation('open cart', () => Promise.resolve());
    expect(timing.operation).toBe('open cart');
  });

  it('measures a non-negative duration around the action', async () => {
    const timing = await measureOperation('wait a tick', async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    expect(timing.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('propagates the underlying action failure instead of swallowing it', async () => {
    await expect(
      measureOperation('failing action', () => Promise.reject(new Error('boom'))),
    ).rejects.toThrow('boom');
  });
});
