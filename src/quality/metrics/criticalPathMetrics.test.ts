import { describe, expect, it } from 'vitest';

import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';

import { calculateCriticalPathMetrics } from './criticalPathMetrics';

function result(criticalPath: boolean, status: QualityStatus): QualityResult {
  return {
    id: `r-${Math.random()}`,
    executionId: 'exec-1',
    timestamp: '2026-08-15T10:00:00.000Z',
    source: QualitySource.Junit,
    category: QualityCategory.Functional,
    suite: 'smoke',
    status,
    criticalPath,
  };
}

describe('calculateCriticalPathMetrics', () => {
  it('ignores non-critical-path results entirely', () => {
    const metrics = calculateCriticalPathMetrics([
      result(false, QualityStatus.Failed),
      result(true, QualityStatus.Passed),
    ]);
    expect(metrics.executed).toBe(1);
    expect(metrics.passRate).toBe(1);
  });

  it('requires every executed critical-path test to pass for a perfect rate', () => {
    const metrics = calculateCriticalPathMetrics([
      result(true, QualityStatus.Passed),
      result(true, QualityStatus.Failed),
    ]);
    expect(metrics.passRate).toBe(0.5);
    expect(metrics.failed).toBe(1);
  });
});
