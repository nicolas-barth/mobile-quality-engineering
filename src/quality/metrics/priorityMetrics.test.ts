import { describe, expect, it } from 'vitest';

import { FailureCategory } from '../../types/failure';
import {
  QualityCategory,
  QualityResult,
  QualitySource,
  QualityStatus,
  TestPriority,
} from '../types/result';

import { calculatePriorityMetrics } from './priorityMetrics';

function result(priority: TestPriority, status: QualityStatus): QualityResult {
  return {
    id: `r-${Math.random()}`,
    executionId: 'exec-1',
    timestamp: '2026-08-15T10:00:00.000Z',
    source: QualitySource.Junit,
    category: QualityCategory.Functional,
    suite: 'smoke',
    status,
    priority,
  };
}

describe('calculatePriorityMetrics', () => {
  it('makes P0 failures clearly visible and keeps priorities independent', () => {
    const metrics = calculatePriorityMetrics([
      result('P0', QualityStatus.Passed),
      result('P0', QualityStatus.Failed),
      result('P1', QualityStatus.Passed),
    ]);

    expect(metrics.P0).toEqual({ total: 2, executed: 2, passed: 1, failed: 1, passRate: 0.5 });
    expect(metrics.P1).toEqual({ total: 1, executed: 1, passed: 1, failed: 0, passRate: 1 });
    expect(metrics.P2).toEqual({ total: 0, executed: 0, passed: 0, failed: 0, passRate: 0 });
  });

  it('excludes NOT_EXECUTED results from the executed count and pass rate', () => {
    const metrics = calculatePriorityMetrics([
      result('P0', QualityStatus.NotExecuted),
      result('P0', QualityStatus.Passed),
    ]);
    expect(metrics.P0).toEqual({ total: 2, executed: 1, passed: 1, failed: 0, passRate: 1 });
  });

  it('does not let an environment/infrastructure failure count as a product failure against the gate-feeding pass rate', () => {
    const infraFailure: QualityResult = {
      ...result('P0', QualityStatus.Failed),
      failureCategory: FailureCategory.InfrastructureFailure,
    };
    const metrics = calculatePriorityMetrics([infraFailure, result('P0', QualityStatus.Passed)]);
    expect(metrics.P0).toEqual({ total: 2, executed: 1, passed: 1, failed: 0, passRate: 1 });
  });
});
