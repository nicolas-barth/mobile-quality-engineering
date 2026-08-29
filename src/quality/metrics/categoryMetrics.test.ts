import { describe, expect, it } from 'vitest';

import { FailureCategory } from '../../types/failure';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';

import { calculateCategoryMetrics } from './categoryMetrics';

function result(category: QualityCategory, status: QualityStatus): QualityResult {
  return {
    id: `r-${Math.random()}`,
    executionId: 'exec-1',
    timestamp: '2026-08-15T10:00:00.000Z',
    source: QualitySource.Junit,
    category,
    suite: 'smoke',
    status,
  };
}

describe('calculateCategoryMetrics', () => {
  it('only reports categories with at least one result, never fabricating zero-evidence categories', () => {
    const metrics = calculateCategoryMetrics([
      result(QualityCategory.Functional, QualityStatus.Passed),
    ]);

    expect(metrics.FUNCTIONAL).toEqual({
      executed: 1,
      passed: 1,
      failed: 0,
      notExecuted: 0,
      passRate: 1,
    });
    expect(metrics.ACCESSIBILITY).toBeUndefined();
  });

  it('computes an independent pass rate per category', () => {
    const metrics = calculateCategoryMetrics([
      result(QualityCategory.Security, QualityStatus.Failed),
      result(QualityCategory.Security, QualityStatus.Passed),
      result(QualityCategory.Security, QualityStatus.Passed),
    ]);
    expect(metrics.SECURITY?.passRate).toBeCloseTo(2 / 3, 5);
  });

  it('treats an environment-classified failure as not executed rather than a product failure', () => {
    const infraFailure: QualityResult = {
      ...result(QualityCategory.Functional, QualityStatus.Failed),
      failureCategory: FailureCategory.EnvironmentFailure,
    };
    const metrics = calculateCategoryMetrics([
      infraFailure,
      result(QualityCategory.Functional, QualityStatus.Passed),
    ]);
    expect(metrics.FUNCTIONAL).toEqual({
      executed: 1,
      passed: 1,
      failed: 0,
      notExecuted: 1,
      passRate: 1,
    });
  });
});
