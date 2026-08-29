import { describe, expect, it } from 'vitest';

import { buildQualityMetrics } from '../metrics';
import { MissingEvidencePolicyConfig, PolicyProfile } from '../types/policy';

import { evaluateMissingEvidence } from './missingEvidence';

function profile(overrides: Partial<PolicyProfile> = {}): PolicyProfile {
  return {
    profile: 'RELEASE',
    description: 'd',
    requiredCategories: ['CRITICAL_PATH', 'VISUAL'],
    enabledGates: [],
    missingEvidenceOverrides: {},
    gateOverrides: {},
    mandatoryCompatibilityProfiles: [],
    minimumScore: 85,
    conditionalGoExitCode: 0,
    ...overrides,
  };
}

const BASE_POLICY: MissingEvidencePolicyConfig = {
  description: 'd',
  categories: { CRITICAL_PATH: 'BLOCK', VISUAL: 'WARNING' },
  manualEvidence: {},
};

describe('evaluateMissingEvidence', () => {
  it('blocks a required category with no executed evidence when the baseline policy says BLOCK', () => {
    const metrics = buildQualityMetrics({ results: [], traceabilityEntries: [] });
    const { blockers, warnings } = evaluateMissingEvidence(metrics, profile(), BASE_POLICY);

    expect(blockers).toHaveLength(1);
    expect(blockers[0]?.category).toBe('CRITICAL_PATH');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.category).toBe('VISUAL');
  });

  it('a profile override relaxing BLOCK to IGNORE produces neither a blocker nor a warning', () => {
    const metrics = buildQualityMetrics({ results: [], traceabilityEntries: [] });
    const { blockers, warnings } = evaluateMissingEvidence(
      metrics,
      profile({ missingEvidenceOverrides: { CRITICAL_PATH: 'IGNORE', VISUAL: 'IGNORE' } }),
      BASE_POLICY,
    );

    expect(blockers).toEqual([]);
    expect(warnings).toEqual([]);
  });
});
