import { describe, expect, it } from 'vitest';

import { FailureCategory } from '../../types/failure';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';

import { calculateReliabilityMetrics } from './reliabilityMetrics';

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

describe('calculateReliabilityMetrics', () => {
  it('reports null stability figures rather than fabricating them when no stability evidence exists', () => {
    const metrics = calculateReliabilityMetrics([]);
    expect(metrics.firstRunPassRate).toBeNull();
    expect(metrics.finalPassRate).toBeNull();
    expect(metrics.flakyRate).toBeNull();
    expect(metrics.hasStabilityEvidence).toBe(false);
    expect(metrics.crashCount).toBe(0);
    expect(metrics.anrCount).toBe(0);
  });

  it('surfaces real stability summary numbers and Monkey crash/ANR detection', () => {
    const metrics = calculateReliabilityMetrics(
      [],
      {
        executions: 10,
        passed: 9,
        failed: 1,
        firstRunPassRate: 1,
        finalPassRate: 0.9,
        flakyRate: 0.1,
        failuresByCategory: {},
      },
      {
        packageName: 'x',
        seed: 1,
        eventCount: 500,
        exitCode: 0,
        crashDetected: true,
        anrDetected: false,
        output: '',
      },
    );

    expect(metrics.finalPassRate).toBe(0.9);
    expect(metrics.hasStabilityEvidence).toBe(true);
    expect(metrics.crashCount).toBe(1);
    expect(metrics.anrCount).toBe(0);
  });

  it('splits classified failures between environment-like and automation defect rates', () => {
    const metrics = calculateReliabilityMetrics([
      failedResult(FailureCategory.InfrastructureFailure),
      failedResult(FailureCategory.AutomationDefect),
      failedResult(FailureCategory.AutomationDefect),
    ]);

    expect(metrics.environmentFailureRate).toBeCloseTo(1 / 3, 5);
    expect(metrics.automationFailureRate).toBeCloseTo(2 / 3, 5);
  });
});
