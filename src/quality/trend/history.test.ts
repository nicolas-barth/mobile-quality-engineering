import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { QualitySnapshot } from '../types/trend';

import { loadLatestQualitySnapshot, saveQualitySnapshot } from './history';

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

describe('quality history', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-history-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('returns undefined when no history has been saved yet', () => {
    expect(loadLatestQualitySnapshot(root)).toBeUndefined();
  });

  it('saves a snapshot under its app version and as latest.json, both loadable', () => {
    saveQualitySnapshot(snapshot(), root);

    expect(fs.existsSync(path.join(root, 'quality-history', '2.2.0.json'))).toBe(true);
    expect(loadLatestQualitySnapshot(root)).toEqual(snapshot());
  });

  it('overwrites latest.json on each save while preserving prior versioned snapshots', () => {
    saveQualitySnapshot(snapshot({ appVersion: '2.2.0', score: 80 }), root);
    saveQualitySnapshot(snapshot({ appVersion: '2.3.0', score: 90 }), root);

    expect(fs.existsSync(path.join(root, 'quality-history', '2.2.0.json'))).toBe(true);
    expect(loadLatestQualitySnapshot(root)?.appVersion).toBe('2.3.0');
  });
});
