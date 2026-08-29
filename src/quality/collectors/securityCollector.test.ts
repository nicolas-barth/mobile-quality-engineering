import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { QualityStatus } from '../types/result';

import { collectSecurityResults, isDependencyFinding } from './securityCollector';

describe('collectSecurityResults', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-security-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('reports no evidence when summary.json does not exist', () => {
    const output = collectSecurityResults(root, {
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
    });

    expect(output.hasEvidence).toBe(false);
    expect(output.results).toEqual([]);
  });

  it('normalizes findings into quality results, marking HIGH/CRITICAL as failed and LOW as warning', () => {
    fs.mkdirSync(path.join(root, 'reports', 'security'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'reports', 'security', 'summary.json'),
      JSON.stringify({
        generatedAt: '2026-08-15T09:00:00.000Z',
        disclaimer: 'test',
        findings: [
          {
            id: 'SEC-DEP-high',
            category: 'security',
            severity: 'HIGH',
            title: '2 high severity dependency vulnerabilities',
            description: '...',
            status: 'open',
          },
          {
            id: 'SEC-ACT-1',
            category: 'security',
            severity: 'LOW',
            title: 'Debug-named activity',
            description: '...',
            status: 'testability-issue',
          },
        ],
      }),
    );

    const output = collectSecurityResults(root, {
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
    });

    expect(output.hasEvidence).toBe(true);
    expect(output.findings).toHaveLength(2);
    expect(output.results).toHaveLength(3);
    expect(output.results[0]).toMatchObject({ status: QualityStatus.Failed });
    expect(output.results[0]?.traceId).toBeUndefined();
    expect(output.results[1]).toMatchObject({
      status: QualityStatus.Failed,
      traceId: 'SEC-DEP-high',
    });
    expect(output.results[2]).toMatchObject({
      status: QualityStatus.Warning,
      traceId: 'SEC-ACT-1',
    });
    expect(isDependencyFinding(output.findings[0]!)).toBe(true);
    expect(isDependencyFinding(output.findings[1]!)).toBe(false);
  });

  it('still emits a PASSED summary result when the scan ran clean with zero findings, so the category is never treated as unevaluated', () => {
    fs.mkdirSync(path.join(root, 'reports', 'security'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'reports', 'security', 'summary.json'),
      JSON.stringify({ generatedAt: '2026-08-15T09:00:00.000Z', disclaimer: 'test', findings: [] }),
    );

    const output = collectSecurityResults(root, {
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
    });

    expect(output.hasEvidence).toBe(true);
    expect(output.results).toHaveLength(1);
    expect(output.results[0]).toMatchObject({ status: QualityStatus.Passed });
  });

  it('throws a QualityEngineError on malformed summary JSON', () => {
    fs.mkdirSync(path.join(root, 'reports', 'security'), { recursive: true });
    fs.writeFileSync(path.join(root, 'reports', 'security', 'summary.json'), '{ not json');

    expect(() =>
      collectSecurityResults(root, {
        executionId: 'exec-1',
        timestamp: '2026-08-15T10:00:00.000Z',
      }),
    ).toThrow(/Could not parse/);
  });
});
