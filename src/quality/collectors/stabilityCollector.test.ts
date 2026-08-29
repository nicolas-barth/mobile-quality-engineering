import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { QualityStatus } from '../types/result';

import { collectStabilityResults } from './stabilityCollector';

describe('collectStabilityResults', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-stability-'));
    fs.mkdirSync(path.join(root, 'reports', 'stability'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('returns no results when no stability evidence exists', () => {
    const output = collectStabilityResults(root, {
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
    });

    expect(output.results).toEqual([]);
    expect(output.summary).toBeUndefined();
    expect(output.monkey).toBeUndefined();
  });

  it('marks a perfect final pass rate as passed and a flaky rate as a warning', () => {
    fs.writeFileSync(
      path.join(root, 'reports', 'stability', 'summary.json'),
      JSON.stringify({
        executions: 10,
        passed: 9,
        failed: 1,
        firstRunPassRate: 1,
        finalPassRate: 0.9,
        flakyRate: 0.1,
        failuresByCategory: { AUTOMATION_DEFECT: 1 },
      }),
    );

    const output = collectStabilityResults(root, {
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
    });

    expect(output.summary?.flakyRate).toBe(0.1);
    expect(output.results[0]?.status).toBe(QualityStatus.Warning);
  });

  it('marks a Monkey crash detection as failed', () => {
    fs.writeFileSync(
      path.join(root, 'reports', 'stability', 'monkey.json'),
      JSON.stringify({
        packageName: 'com.saucelabs.mydemoapp.android',
        seed: 42,
        eventCount: 500,
        exitCode: 0,
        crashDetected: true,
        anrDetected: false,
        output: '...',
        logcat: '...',
      }),
    );

    const output = collectStabilityResults(root, {
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
    });

    expect(output.monkey?.crashDetected).toBe(true);
    expect(output.results[0]?.status).toBe(QualityStatus.Failed);
  });

  it('throws on malformed summary.json', () => {
    fs.writeFileSync(path.join(root, 'reports', 'stability', 'summary.json'), '{"executions": 1}');

    expect(() =>
      collectStabilityResults(root, {
        executionId: 'exec-1',
        timestamp: '2026-08-15T10:00:00.000Z',
      }),
    ).toThrow(/missing required stability metric fields/);
  });
});
