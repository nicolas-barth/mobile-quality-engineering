import { describe, expect, it } from 'vitest';

import { FailureCategory } from '../../types/failure';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';

import { calculateFailureDistribution } from './failureDistribution';

function failedResult(failureCategory: FailureCategory): QualityResult {
  return {
    id: `r-${Math.random()}`,
    executionId: 'exec-1',
    timestamp: '2026-08-15T10:00:00.000Z',
    source: QualitySource.Junit,
    category: QualityCategory.Functional,
    suite: 'smoke',
    status: QualityStatus.Failed,
    failureCategory,
  };
}

describe('calculateFailureDistribution', () => {
  it('includes every failure category, even those with zero occurrences', () => {
    const distribution = calculateFailureDistribution([
      failedResult(FailureCategory.ProductDefect),
    ]);

    expect(distribution[FailureCategory.ProductDefect]).toEqual({ count: 1, percentage: 1 });
    expect(distribution[FailureCategory.AutomationDefect]).toEqual({ count: 0, percentage: 0 });
  });

  it('computes percentages relative to total classified failures', () => {
    const distribution = calculateFailureDistribution([
      failedResult(FailureCategory.ProductDefect),
      failedResult(FailureCategory.ProductDefect),
      failedResult(FailureCategory.AutomationDefect),
    ]);

    expect(distribution[FailureCategory.ProductDefect].percentage).toBeCloseTo(2 / 3, 5);
    expect(distribution[FailureCategory.AutomationDefect].percentage).toBeCloseTo(1 / 3, 5);
  });
});
