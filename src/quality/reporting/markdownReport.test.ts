import { describe, expect, it } from 'vitest';

import { buildQualityMetrics } from '../metrics';
import { ReleaseAssessment, ReleaseDecision } from '../types/decision';

import { buildEvidenceManifest } from './evidenceManifest';
import { buildReleaseReportMarkdown } from './markdownReport';

function assessment(overrides: Partial<ReleaseAssessment> = {}): ReleaseAssessment {
  const metrics = buildQualityMetrics({ results: [], traceabilityEntries: [] });
  return {
    schemaVersion: '1.0',
    releaseId: 'release-1',
    generatedAt: '2026-08-15T10:00:00.000Z',
    dataMode: 'REAL',
    environment: 'local',
    policyProfile: 'RELEASE',
    decision: ReleaseDecision.NoGo,
    decisionLabel: 'NO-GO',
    confidence: 'LOW',
    score: 40,
    minimumScore: 85,
    gates: [
      {
        id: 'p0Failures',
        name: 'P0 failures',
        category: 'FUNCTIONAL',
        status: 'FAIL',
        expected: '<= 0',
        actual: '1',
        reason: 'a P0 test failed',
        blocking: true,
      },
    ],
    metrics,
    dimensions: [],
    risk: { level: 'CRITICAL', contributors: [{ description: 'P0 failed', level: 'CRITICAL' }] },
    blockers: [
      {
        code: 'GATE_FAILED',
        message: 'P0 failures failed',
        category: 'FUNCTIONAL',
        gateId: 'p0Failures',
      },
    ],
    warnings: [],
    conditions: [],
    recommendations: ['Investigate the P0 failure.'],
    ...overrides,
  };
}

describe('buildReleaseReportMarkdown', () => {
  it('renders a report containing every required section for a NO-GO assessment', () => {
    const markdown = buildReleaseReportMarkdown(
      assessment(),
      { comparable: false, comparisons: [], regressions: [] },
      buildEvidenceManifest(process.cwd(), '2026-08-15T10:00:00.000Z'),
    );

    for (const heading of [
      '# Release Readiness Report',
      '## Decision',
      '## Executive Summary',
      '## Blocking Gates',
      '## Warnings',
      '## Quality Scorecard',
      '## Quality Gates',
      '## Execution Coverage',
      '## Failure Distribution',
      '## Evidence Availability',
      '## Trend',
      '## Known Limitations',
      '## Release Conditions',
      '## Recommendation',
    ]) {
      expect(markdown).toContain(heading);
    }

    expect(markdown).toContain('NO-GO');
    expect(markdown).toContain('P0 failures failed');
  });
});
