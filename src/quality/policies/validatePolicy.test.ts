import { describe, expect, it } from 'vitest';

import { PolicyProfile, QualityGatesConfig, QualityWeightsConfig } from '../types/policy';

import {
  validateGatesConfig,
  validatePolicyProfile,
  validateProfileStrictness,
  validateWeightsConfig,
} from './validatePolicy';

describe('validateGatesConfig', () => {
  it('accepts a well-formed rate gate and count gate', () => {
    const gates: QualityGatesConfig = {
      functionalPassRate: { min: 0.95, blocking: true, description: 'doc' },
      p0Failures: { max: 0, blocking: true, description: 'doc' },
    };
    expect(validateGatesConfig(gates)).toEqual([]);
  });

  it('rejects a rate gate threshold outside 0-1', () => {
    const gates: QualityGatesConfig = {
      functionalPassRate: { min: 1.5, blocking: true, description: 'doc' },
    };
    expect(validateGatesConfig(gates)).toContainEqual(expect.stringMatching(/between 0 and 1/));
  });

  it('rejects a negative count gate threshold', () => {
    const gates: QualityGatesConfig = {
      p0Failures: { max: -1, blocking: true, description: 'doc' },
    };
    expect(validateGatesConfig(gates)).toContainEqual(expect.stringMatching(/non-negative/));
  });

  it('rejects a gate with no documented description', () => {
    const gates: QualityGatesConfig = { p0Failures: { max: 0, blocking: true, description: '' } };
    expect(validateGatesConfig(gates)).toContainEqual(
      expect.stringMatching(/missing a documented description/),
    );
  });
});

describe('validateWeightsConfig', () => {
  it('accepts weights that sum to exactly 100', () => {
    const config: QualityWeightsConfig = { description: 'd', weights: { A: 60, B: 40 } };
    expect(validateWeightsConfig(config)).toEqual([]);
  });

  it('rejects weights that do not sum to 100', () => {
    const config: QualityWeightsConfig = { description: 'd', weights: { A: 60, B: 30 } };
    expect(validateWeightsConfig(config)).toContainEqual(
      expect.stringMatching(/sum to exactly 100/),
    );
  });
});

function buildProfile(overrides: Partial<PolicyProfile> = {}): PolicyProfile {
  return {
    profile: 'PR',
    description: 'd',
    requiredCategories: ['FUNCTIONAL'],
    enabledGates: ['p0Failures'],
    missingEvidenceOverrides: {},
    gateOverrides: {},
    mandatoryCompatibilityProfiles: [],
    minimumScore: 70,
    conditionalGoExitCode: 0,
    ...overrides,
  };
}

describe('validatePolicyProfile', () => {
  it('rejects a profile that references an unknown gate id', () => {
    const profile = buildProfile({ enabledGates: ['doesNotExist'] });
    expect(validatePolicyProfile(profile, new Set(['p0Failures']))).toContainEqual(
      expect.stringMatching(/unknown gate id/),
    );
  });

  it('rejects a minimumScore outside 0-100', () => {
    const profile = buildProfile({ minimumScore: 150 });
    expect(validatePolicyProfile(profile, new Set(['p0Failures']))).toContainEqual(
      expect.stringMatching(/minimumScore must be between/),
    );
  });
});

describe('validateProfileStrictness', () => {
  it('requires RELEASE to be at least as strict as PR', () => {
    const pr = buildProfile({ profile: 'PR', minimumScore: 90, requiredCategories: ['A', 'B'] });
    const release = buildProfile({
      profile: 'RELEASE',
      minimumScore: 50,
      requiredCategories: ['A'],
    });
    const errors = validateProfileStrictness({ PR: pr, MAIN: pr, NIGHTLY: pr, RELEASE: release });
    expect(errors.length).toBeGreaterThan(0);
  });
});
