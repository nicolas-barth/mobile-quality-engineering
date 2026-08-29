import { describe, expect, it } from 'vitest';

import { QualityGateResult } from '../types/gate';
import { PolicyProfile } from '../types/policy';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';

import { calculateResidualRisk } from './riskModel';

function profile(overrides: Partial<PolicyProfile> = {}): PolicyProfile {
  return {
    profile: 'RELEASE',
    description: 'd',
    requiredCategories: ['ACCESSIBILITY'],
    enabledGates: [],
    missingEvidenceOverrides: {},
    gateOverrides: {},
    mandatoryCompatibilityProfiles: ['android-min-supported', 'android-latest'],
    minimumScore: 85,
    conditionalGoExitCode: 0,
    ...overrides,
  };
}

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

describe('calculateResidualRisk', () => {
  it('reports LOW risk with no contributors when everything passes', () => {
    const risk = calculateResidualRisk([], [gate({ status: 'PASS' })], profile());
    expect(risk.level).toBe('LOW');
    expect(risk.contributors).toEqual([]);
  });

  it('escalates to CRITICAL when a blocking gate fails', () => {
    const risk = calculateResidualRisk(
      [],
      [gate({ status: 'FAIL', blocking: true, name: 'Crash count' })],
      profile(),
    );
    expect(risk.level).toBe('CRITICAL');
  });

  it('flags a missing required category as a MEDIUM contributor, not a hidden pass', () => {
    const risk = calculateResidualRisk(
      [],
      [gate({ id: 'accessibilityCritical', status: 'NOT_EVALUATED', category: 'ACCESSIBILITY' })],
      profile({ requiredCategories: ['ACCESSIBILITY'] }),
    );
    expect(risk.contributors).toHaveLength(1);
    expect(risk.contributors[0]?.level).toBe('MEDIUM');
  });

  it('lists failed P0 tests by name as CRITICAL contributors', () => {
    const failedP0: QualityResult = {
      id: 'r-1',
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
      source: QualitySource.Junit,
      category: QualityCategory.Functional,
      suite: 'tests/functional/checkout/checkoutOverviewAndCompletion.spec.ts',
      test: 'completes the purchase',
      status: QualityStatus.Failed,
      priority: 'P0',
      traceId: 'MOB-CHK-003',
    };
    const risk = calculateResidualRisk([failedP0], [], profile());
    expect(risk.level).toBe('CRITICAL');
    expect(risk.contributors[0]?.traceId).toBe('MOB-CHK-003');
  });

  it('reports partial mandatory compatibility profile coverage with the exact fraction', () => {
    const risk = calculateResidualRisk(
      [],
      [
        gate({
          id: 'compatibilityMandatoryProfiles',
          status: 'FAIL',
          category: 'COMPATIBILITY',
          actual: '1/2',
        }),
      ],
      profile(),
    );
    expect(
      risk.contributors.some((c) => c.description.includes('1/2 of 2 mandatory profiles')),
    ).toBe(true);
  });
});
