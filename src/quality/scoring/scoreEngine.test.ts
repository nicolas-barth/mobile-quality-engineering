import { describe, expect, it } from 'vitest';

import { buildQualityMetrics } from '../metrics';
import { QualityWeightsConfig } from '../types/policy';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';

import { calculateReleaseScore } from './scoreEngine';

const WEIGHTS: QualityWeightsConfig = {
  description: 'test',
  weights: {
    FUNCTIONAL: 25,
    CRITICAL_PATH: 15,
    STABILITY: 15,
    COMPATIBILITY: 10,
    ACCESSIBILITY: 10,
    SECURITY: 10,
    VISUAL: 5,
    INSTALLATION: 5,
    PERFORMANCE: 5,
  },
};

function result(overrides: Partial<QualityResult>): QualityResult {
  return {
    id: `r-${Math.random()}`,
    executionId: 'exec-1',
    timestamp: '2026-08-15T10:00:00.000Z',
    source: QualitySource.Junit,
    category: QualityCategory.Functional,
    suite: 'smoke',
    status: QualityStatus.Passed,
    ...overrides,
  };
}

describe('calculateReleaseScore', () => {
  it('sums the configured weights to exactly 100', () => {
    expect(Object.values(WEIGHTS.weights).reduce((sum, weight) => sum + weight, 0)).toBe(100);
  });

  it('awards zero points and UNAVAILABLE for a dimension with no evidence at all', () => {
    const metrics = buildQualityMetrics({ results: [], traceabilityEntries: [] });
    const { score, dimensions } = calculateReleaseScore(metrics, WEIGHTS);

    expect(score).toBe(0);
    expect(dimensions.every((dimension) => dimension.evidenceStatus === 'UNAVAILABLE')).toBe(true);
  });

  it('awards full marks across every dimension for perfect evidence', () => {
    const results = [
      result({ category: QualityCategory.Functional, criticalPath: true }),
      result({ category: QualityCategory.Compatibility }),
      result({ category: QualityCategory.Accessibility }),
      result({ category: QualityCategory.Security }),
      result({ category: QualityCategory.Visual }),
      result({ category: QualityCategory.Installation }),
      result({ category: QualityCategory.Performance }),
    ];
    const metrics = buildQualityMetrics({
      results,
      traceabilityEntries: [],
      stabilitySummary: {
        executions: 10,
        passed: 10,
        failed: 0,
        firstRunPassRate: 1,
        finalPassRate: 1,
        flakyRate: 0,
        failuresByCategory: {},
      },
    });

    const { score } = calculateReleaseScore(metrics, WEIGHTS);
    expect(score).toBe(100);
  });

  it('marks a dimension PARTIAL when only one of its pooled categories has evidence', () => {
    const results = [result({ category: QualityCategory.Functional })];
    const metrics = buildQualityMetrics({ results, traceabilityEntries: [] });
    const { dimensions } = calculateReleaseScore(metrics, WEIGHTS);

    const functional = dimensions.find((dimension) => dimension.category === 'FUNCTIONAL');
    expect(functional?.evidenceStatus).toBe('PARTIAL');
    expect(functional?.score).toBe(25);
  });

  it('zeroes the stability dimension outright when a crash is detected, even with a perfect pass rate', () => {
    const metrics = buildQualityMetrics({
      results: [],
      traceabilityEntries: [],
      stabilitySummary: {
        executions: 10,
        passed: 10,
        failed: 0,
        firstRunPassRate: 1,
        finalPassRate: 1,
        flakyRate: 0,
        failuresByCategory: {},
      },
      monkeyResult: {
        packageName: 'x',
        seed: 1,
        eventCount: 500,
        exitCode: 0,
        crashDetected: true,
        anrDetected: false,
        output: '',
      },
    });

    const { dimensions } = calculateReleaseScore(metrics, WEIGHTS);
    expect(dimensions.find((dimension) => dimension.category === 'STABILITY')?.score).toBe(0);
  });

  it('reduces the functional score in proportion to failures rather than an all-or-nothing cutoff', () => {
    const results = [
      result({ status: QualityStatus.Passed }),
      result({ status: QualityStatus.Passed }),
      result({ status: QualityStatus.Passed }),
      result({ status: QualityStatus.Failed }),
    ];
    const metrics = buildQualityMetrics({ results, traceabilityEntries: [] });
    const { dimensions } = calculateReleaseScore(metrics, WEIGHTS);
    const functional = dimensions.find((dimension) => dimension.category === 'FUNCTIONAL');
    expect(functional?.score).toBeCloseTo(25 * 0.75, 5);
  });
});
