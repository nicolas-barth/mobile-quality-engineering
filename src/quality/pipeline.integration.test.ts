import { describe, expect, it } from 'vitest';

import { loadQualityFixture } from './fixtures';
import { assessQualityEvidence } from './pipeline';
import { ReleaseDecision } from './types/decision';

function assess(fixtureName: string, profile: 'PR' | 'MAIN' | 'NIGHTLY' | 'RELEASE' = 'RELEASE') {
  const evidence = loadQualityFixture(fixtureName);
  return assessQualityEvidence(evidence, profile);
}

describe('quality governance pipeline (fixture scenarios)', () => {
  it('healthy-release: GO under RELEASE policy', () => {
    const { assessment } = assess('healthy-release');
    expect(assessment.decision).toBe(ReleaseDecision.Go);
    expect(assessment.blockers).toEqual([]);
    expect(assessment.dataMode).toBe('SIMULATED');
  });

  it('critical-failure: NO_GO because the checkout critical path failed, regardless of an otherwise high score', () => {
    const { assessment } = assess('critical-failure');
    expect(assessment.decision).toBe(ReleaseDecision.NoGo);
    expect(assessment.score).toBeGreaterThan(50);
    expect(assessment.blockers.some((blocker) => blocker.gateId === 'p0Failures')).toBe(true);
  });

  it('flaky-release: CONDITIONAL_GO from the non-blocking flaky-rate gate alone', () => {
    const { assessment } = assess('flaky-release');
    expect(assessment.decision).toBe(ReleaseDecision.ConditionalGo);
    expect(assessment.blockers).toEqual([]);
    expect(assessment.warnings.some((warning) => warning.gateId === 'flakyRate')).toBe(true);
  });

  it('missing-evidence: CONDITIONAL_GO when only non-critical categories (visual, upgrade) are missing', () => {
    const { assessment } = assess('missing-evidence');
    expect(assessment.decision).toBe(ReleaseDecision.ConditionalGo);
    expect(assessment.blockers).toEqual([]);
    expect(assessment.warnings.some((warning) => warning.category === 'VISUAL')).toBe(true);
    expect(assessment.warnings.some((warning) => warning.category === 'UPGRADE')).toBe(true);
  });

  it('security-blocker: NO_GO from a single CRITICAL security finding', () => {
    const { assessment } = assess('security-blocker');
    expect(assessment.decision).toBe(ReleaseDecision.NoGo);
    expect(assessment.blockers.some((blocker) => blocker.gateId === 'securityCritical')).toBe(true);
  });

  it('environment-failure: does not automatically become a product NO-GO', () => {
    const { assessment } = assess('environment-failure');
    expect(assessment.decision).not.toBe(ReleaseDecision.NoGo);
    expect(assessment.metrics.execution.failed).toBeGreaterThan(0);
    expect(assessment.metrics.reliability.environmentFailureRate).toBeGreaterThan(0);
  });

  it('empty-evidence: NO_GO with LOW confidence rather than a fabricated GO', () => {
    const { assessment } = assess('empty-evidence');
    expect(assessment.decision).toBe(ReleaseDecision.NoGo);
    expect(assessment.confidence).toBe('LOW');
  });

  it('a less strict PR policy does not require nightly-only evidence categories', () => {
    const { assessment } = assess('missing-evidence', 'PR');
    expect(assessment.decision).not.toBe(ReleaseDecision.NoGo);
  });
});
