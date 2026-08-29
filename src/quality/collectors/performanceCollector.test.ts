import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { QualityStatus } from '../types/result';

import { collectPerformanceResults } from './performanceCollector';

describe('collectPerformanceResults', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-performance-'));
    fs.mkdirSync(path.join(root, 'reports', 'performance'), { recursive: true });
    fs.mkdirSync(path.join(root, 'config', 'quality'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('returns no results when no timings file exists', () => {
    const output = collectPerformanceResults(root, {
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
    });
    expect(output.results).toEqual([]);
    expect(output.maxRegressionRatio).toBeUndefined();
  });

  it('reports informational results with no regression judgement when no baseline is configured', () => {
    fs.writeFileSync(
      path.join(root, 'reports', 'performance', 'functional-timings.json'),
      JSON.stringify({ login: 800, checkout: 1200 }),
    );

    const output = collectPerformanceResults(root, {
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
    });

    expect(output.results).toHaveLength(2);
    expect(output.results.every((result) => result.status === QualityStatus.Passed)).toBe(true);
    expect(output.maxRegressionRatio).toBeUndefined();
  });

  it('flags a regression against a trusted baseline', () => {
    fs.writeFileSync(
      path.join(root, 'reports', 'performance', 'functional-timings.json'),
      JSON.stringify({ login: 1000 }),
    );
    fs.writeFileSync(
      path.join(root, 'config', 'quality', 'performance-baseline.json'),
      JSON.stringify({ login: 800 }),
    );

    const output = collectPerformanceResults(root, {
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
    });

    expect(output.maxRegressionRatio).toBeCloseTo(0.25, 5);
    expect(output.results[0]?.status).toBe(QualityStatus.Warning);
  });
});
