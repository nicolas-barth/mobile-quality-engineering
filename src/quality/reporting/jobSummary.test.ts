import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildQualityMetrics } from '../metrics';
import { ReleaseAssessment, ReleaseDecision } from '../types/decision';

import { buildJobSummaryMarkdown, writeGithubJobSummary } from './jobSummary';

function assessment(): ReleaseAssessment {
  return {
    schemaVersion: '1.0',
    releaseId: 'release-1',
    generatedAt: '2026-08-15T10:00:00.000Z',
    dataMode: 'REAL',
    environment: 'local',
    policyProfile: 'RELEASE',
    decision: ReleaseDecision.Go,
    decisionLabel: 'GO',
    confidence: 'HIGH',
    score: 93,
    minimumScore: 85,
    gates: [],
    metrics: buildQualityMetrics({ results: [], traceabilityEntries: [] }),
    dimensions: [],
    risk: { level: 'LOW', contributors: [] },
    blockers: [],
    warnings: [{ code: 'X', message: 'a warning', category: 'VISUAL' }],
    conditions: [],
    recommendations: [],
  };
}

describe('buildJobSummaryMarkdown', () => {
  it('renders the decision, score, confidence and a warnings section', () => {
    const markdown = buildJobSummaryMarkdown(assessment());
    expect(markdown).toContain('GO');
    expect(markdown).toContain('93/100');
    expect(markdown).toContain('a warning');
  });
});

describe('writeGithubJobSummary', () => {
  let summaryPath: string;

  beforeEach(() => {
    summaryPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'quality-summary-')),
      'summary.md',
    );
  });

  afterEach(() => {
    fs.rmSync(path.dirname(summaryPath), { recursive: true, force: true });
  });

  it('does nothing when GITHUB_STEP_SUMMARY is not set', () => {
    writeGithubJobSummary(assessment(), {});
    expect(fs.existsSync(summaryPath)).toBe(false);
  });

  it('appends the summary to the path in GITHUB_STEP_SUMMARY', () => {
    fs.writeFileSync(summaryPath, '');
    writeGithubJobSummary(assessment(), { GITHUB_STEP_SUMMARY: summaryPath });
    expect(fs.readFileSync(summaryPath, 'utf-8')).toContain('Mobile Release Readiness');
  });
});
