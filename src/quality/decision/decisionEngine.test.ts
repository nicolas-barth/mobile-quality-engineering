import { describe, expect, it } from 'vitest';

import { buildQualityMetrics } from '../metrics';
import { ReleaseDecision } from '../types/decision';
import { QualityGateResult } from '../types/gate';
import { MissingEvidencePolicyConfig, PolicyProfile } from '../types/policy';

import { decideRelease } from './decisionEngine';

function gate(overrides: Partial<QualityGateResult>): QualityGateResult {
  return {
    id: 'x',
    name: 'x gate',
    category: 'FUNCTIONAL',
    status: 'PASS',
    expected: '',
    actual: '',
    reason: '',
    blocking: false,
    ...overrides,
  };
}

function profile(overrides: Partial<PolicyProfile> = {}): PolicyProfile {
  return {
    profile: 'RELEASE',
    description: 'd',
    requiredCategories: [],
    enabledGates: [],
    missingEvidenceOverrides: {},
    gateOverrides: {},
    mandatoryCompatibilityProfiles: [],
    minimumScore: 85,
    conditionalGoExitCode: 0,
    ...overrides,
  };
}

const NO_MISSING_EVIDENCE: MissingEvidencePolicyConfig = {
  description: 'd',
  categories: {},
  manualEvidence: {},
};
const metrics = buildQualityMetrics({ results: [], traceabilityEntries: [] });

describe('decideRelease', () => {
  it('returns GO when every gate passes, there are no warnings, and the score meets the minimum', () => {
    const result = decideRelease({
      gates: [gate({ status: 'PASS' })],
      metrics,
      score: 90,
      profile: profile(),
      missingEvidencePolicy: NO_MISSING_EVIDENCE,
    });
    expect(result.decision).toBe(ReleaseDecision.Go);
    expect(result.blockers).toEqual([]);
  });

  it('returns CONDITIONAL_GO when a non-blocking gate fails', () => {
    const result = decideRelease({
      gates: [gate({ id: 'flakyRate', status: 'FAIL', blocking: false })],
      metrics,
      score: 90,
      profile: profile(),
      missingEvidencePolicy: NO_MISSING_EVIDENCE,
    });
    expect(result.decision).toBe(ReleaseDecision.ConditionalGo);
    expect(result.conditions).toHaveLength(1);
  });

  it('returns NO_GO when a blocking gate fails', () => {
    const result = decideRelease({
      gates: [gate({ id: 'p0Failures', status: 'FAIL', blocking: true })],
      metrics,
      score: 90,
      profile: profile(),
      missingEvidencePolicy: NO_MISSING_EVIDENCE,
    });
    expect(result.decision).toBe(ReleaseDecision.NoGo);
  });

  it('never lets a high score override a blocking gate failure', () => {
    const result = decideRelease({
      gates: [gate({ id: 'crashCount', status: 'FAIL', blocking: true })],
      metrics,
      score: 99,
      profile: profile({ minimumScore: 50 }),
      missingEvidencePolicy: NO_MISSING_EVIDENCE,
    });
    expect(result.decision).toBe(ReleaseDecision.NoGo);
  });

  it('demotes GO to CONDITIONAL_GO when the score is below the profile minimum, even with no failing gates', () => {
    const result = decideRelease({
      gates: [gate({ status: 'PASS' })],
      metrics,
      score: 50,
      profile: profile({ minimumScore: 85 }),
      missingEvidencePolicy: NO_MISSING_EVIDENCE,
    });
    expect(result.decision).toBe(ReleaseDecision.ConditionalGo);
  });
});
