import { describe, expect, it } from 'vitest';

import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';

import { calculateExecutionMetrics } from './executionMetrics';

function result(status: QualityStatus, durationMs?: number): QualityResult {
  return {
    id: `r-${Math.random()}`,
    executionId: 'exec-1',
    timestamp: '2026-08-15T10:00:00.000Z',
    source: QualitySource.Junit,
    category: QualityCategory.Functional,
    suite: 'smoke',
    status,
    durationMs,
  };
}

describe('calculateExecutionMetrics', () => {
  it('excludes NOT_EXECUTED from the pass-rate denominator', () => {
    const metrics = calculateExecutionMetrics([
      result(QualityStatus.Passed),
      result(QualityStatus.Passed),
      result(QualityStatus.Failed),
      result(QualityStatus.NotExecuted),
    ]);

    expect(metrics.total).toBe(4);
    expect(metrics.notExecuted).toBe(1);
    expect(metrics.passRate).toBeCloseTo(2 / 3, 5);
    expect(metrics.executionRate).toBeCloseTo(3 / 4, 5);
  });

  it('returns zero rates for an empty result set rather than dividing by zero', () => {
    const metrics = calculateExecutionMetrics([]);
    expect(metrics.passRate).toBe(0);
    expect(metrics.executionRate).toBe(0);
    expect(metrics.averageDurationMs).toBe(0);
  });

  it('averages duration only across results that reported one', () => {
    const metrics = calculateExecutionMetrics([
      result(QualityStatus.Passed, 100),
      result(QualityStatus.Passed, 300),
      result(QualityStatus.Passed),
    ]);
    expect(metrics.averageDurationMs).toBe(200);
    expect(metrics.totalDurationMs).toBe(400);
  });
});
