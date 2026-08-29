import { describe, expect, it } from 'vitest';

import { QualityGateResult } from '../types/gate';
import { PolicyProfile } from '../types/policy';

import { calculateConfidence } from './confidenceEngine';

function gate(overrides: Partial<QualityGateResult>): QualityGateResult {
  return {
    id: 'x',
    name: 'x',
    category: 'FUNCTIONAL',
    status: 'PASS',
    expected: '',
    actual: '',
    reason: '',
    blocking: false,
    ...overrides,
  };
}

function profile(requiredCategories: string[]): PolicyProfile {
  return {
    profile: 'RELEASE',
    description: 'd',
    requiredCategories,
    enabledGates: [],
    missingEvidenceOverrides: {},
    gateOverrides: {},
    mandatoryCompatibilityProfiles: [],
    minimumScore: 85,
    conditionalGoExitCode: 0,
  };
}

describe('calculateConfidence', () => {
  it('is HIGH when every required-category gate was evaluated', () => {
    const confidence = calculateConfidence(
      [
        gate({ category: 'FUNCTIONAL', status: 'PASS' }),
        gate({ category: 'SECURITY', status: 'PASS' }),
      ],
      profile(['FUNCTIONAL', 'SECURITY']),
    );
    expect(confidence).toBe('HIGH');
  });

  it('is LOW when most required-category gates could not be evaluated', () => {
    const confidence = calculateConfidence(
      [
        gate({ category: 'FUNCTIONAL', status: 'NOT_EVALUATED' }),
        gate({ category: 'SECURITY', status: 'NOT_EVALUATED' }),
        gate({ category: 'ACCESSIBILITY', status: 'PASS' }),
      ],
      profile(['FUNCTIONAL', 'SECURITY', 'ACCESSIBILITY']),
    );
    expect(confidence).toBe('LOW');
  });

  it('reflects evidence completeness, not the quality of the evidence itself', () => {
    const confidenceWithFailure = calculateConfidence(
      [gate({ category: 'FUNCTIONAL', status: 'FAIL' })],
      profile(['FUNCTIONAL']),
    );
    expect(confidenceWithFailure).toBe('HIGH');
  });
});
