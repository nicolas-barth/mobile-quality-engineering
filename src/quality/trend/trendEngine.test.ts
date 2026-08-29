import { describe, expect, it } from 'vitest';

import { QualitySnapshot } from '../types/trend';

import { compareQualityTrend } from './trendEngine';

function snapshot(overrides: Partial<QualitySnapshot> = {}): QualitySnapshot {
  return {
    schemaVersion: '1.0',
    releaseId: 'release-1',
    generatedAt: '2026-08-15T10:00:00.000Z',
    appVersion: '2.2.0',
    decision: 'GO',
    score: 90,
    confidence: 'HIGH',
    passRate: 0.95,
    criticalPathPassRate: 1,
    flakyRate: 0.01,
    crashCount: 0,
    anrCount: 0,
    securityCritical: 0,
    securityHigh: 0,
    accessibilityCritical: 0,
    visualFailures: 0,
    executedCoverageRate: 0.8,
    ...overrides,
  };
}

describe('compareQualityTrend', () => {
  it('is NOT_COMPARABLE with no previous snapshot', () => {
    const trend = compareQualityTrend(undefined, snapshot());
    expect(trend.comparable).toBe(false);
    expect(trend.comparisons).toEqual([]);
  });

  it('classifies a higher score as IMPROVED and a higher flaky rate as REGRESSED', () => {
    const trend = compareQualityTrend(
      snapshot({ score: 80, flakyRate: 0.01 }),
      snapshot({ score: 90, flakyRate: 0.05 }),
    );

    expect(trend.comparable).toBe(true);
    expect(trend.comparisons.find((c) => c.metric === 'score')?.classification).toBe('IMPROVED');
    expect(trend.comparisons.find((c) => c.metric === 'flakyRate')?.classification).toBe(
      'REGRESSED',
    );
    expect(trend.regressions).toContain('flakyRate');
  });

  it('treats an identical value as STABLE, not IMPROVED or REGRESSED', () => {
    const trend = compareQualityTrend(snapshot({ score: 90 }), snapshot({ score: 90 }));
    expect(trend.comparisons.find((c) => c.metric === 'score')?.classification).toBe('STABLE');
  });

  it('marks a metric NOT_COMPARABLE when either snapshot lacks a numeric value for it', () => {
    const trend = compareQualityTrend(
      snapshot({ criticalPathPassRate: null as unknown as number }),
      snapshot(),
    );
    expect(trend.comparisons.find((c) => c.metric === 'criticalPathPassRate')?.classification).toBe(
      'NOT_COMPARABLE',
    );
  });
});
