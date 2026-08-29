import { describe, expect, it } from 'vitest';

import { TraceabilityEntry } from '../collectors/traceability';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';

import { calculateCoverageMetrics } from './coverageMetrics';

function entry(id: string): TraceabilityEntry {
  return {
    id,
    specFile: `tests/functional/${id}.spec.ts`,
    feature: 'x',
    risk: 'P1',
    suites: ['functional'],
    priority: 'P1',
    criticalPath: false,
    category: QualityCategory.Functional,
  };
}

function result(
  traceId: string | undefined,
  status: QualityStatus,
  source = QualitySource.Junit,
): QualityResult {
  return {
    id: `r-${Math.random()}`,
    executionId: 'exec-1',
    timestamp: '2026-08-15T10:00:00.000Z',
    source,
    category: QualityCategory.Functional,
    suite: 'smoke',
    status,
    traceId,
  };
}

describe('calculateCoverageMetrics', () => {
  it('never counts an implemented-but-not-run spec as executed coverage', () => {
    const metrics = calculateCoverageMetrics(
      [result('MOB-1', QualityStatus.Passed)],
      [entry('MOB-1'), entry('MOB-2')],
    );

    expect(metrics.implemented).toBe(2);
    expect(metrics.executed).toBe(1);
    expect(metrics.executedCoverageRate).toBeCloseTo(0.5, 5);
  });

  it('treats a spec with any blocked result as blocked, not executed', () => {
    const metrics = calculateCoverageMetrics(
      [result('MOB-1', QualityStatus.Blocked)],
      [entry('MOB-1')],
    );
    expect(metrics.blocked).toBe(1);
    expect(metrics.executed).toBe(0);
  });

  it('counts manual assessments that were genuinely performed as manual-only coverage', () => {
    const metrics = calculateCoverageMetrics(
      [
        result(undefined, QualityStatus.Passed, QualitySource.Manual),
        result(undefined, QualityStatus.NotExecuted, QualitySource.Manual),
      ],
      [],
    );
    expect(metrics.manualOnly).toBe(1);
  });
});
