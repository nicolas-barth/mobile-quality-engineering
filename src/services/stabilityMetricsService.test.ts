import { describe, expect, it } from 'vitest';

import { StabilityExecutionResult } from '../types/stability';

import { summarizeStabilityRun } from './stabilityMetricsService';

function execution(overrides: Partial<StabilityExecutionResult> = {}): StabilityExecutionResult {
  return {
    execution: 1,
    passed: true,
    exitCode: 0,
    durationSeconds: 60,
    timestamp: '2026-08-08T00:00:00Z',
    ...overrides,
  };
}

describe('summarizeStabilityRun', () => {
  it('reports a perfect run with zero flakiness', () => {
    const runs = [1, 2, 3].map((n) => execution({ execution: n, passed: true }));
    const metrics = summarizeStabilityRun(runs);

    expect(metrics).toMatchObject({
      executions: 3,
      passed: 3,
      failed: 0,
      firstRunPassRate: 1,
      finalPassRate: 1,
      flakyRate: 0,
    });
  });

  it('derives firstRunPassRate strictly from the execution numbered one', () => {
    const runs = [
      execution({ execution: 1, passed: false }),
      execution({ execution: 2, passed: true }),
      execution({ execution: 3, passed: true }),
    ];
    const metrics = summarizeStabilityRun(runs);

    expect(metrics.firstRunPassRate).toBe(0);
    expect(metrics.finalPassRate).toBeCloseTo(2 / 3);
  });

  it('treats the minority outcome across repeats as the flaky rate', () => {
    const runs = [
      execution({ execution: 1, passed: true }),
      execution({ execution: 2, passed: true }),
      execution({ execution: 3, passed: false }),
      execution({ execution: 4, passed: true }),
    ];
    const metrics = summarizeStabilityRun(runs);

    expect(metrics.flakyRate).toBeCloseTo(0.25);
  });

  it('tallies failure classifications found in structured log lines', () => {
    const runs = [execution({ passed: false })];
    const logLines = [
      JSON.stringify({ classification: { category: 'PRODUCT_DEFECT' } }),
      JSON.stringify({ classification: { category: 'ENVIRONMENT_FAILURE' } }),
      'not json, should be ignored',
      JSON.stringify({ classification: { category: 'PRODUCT_DEFECT' } }),
    ];

    const metrics = summarizeStabilityRun(runs, logLines);

    expect(metrics.failuresByCategory).toEqual({
      PRODUCT_DEFECT: 2,
      ENVIRONMENT_FAILURE: 1,
    });
  });

  it('throws rather than reporting metrics for zero executions', () => {
    expect(() => summarizeStabilityRun([])).toThrow();
  });
});
