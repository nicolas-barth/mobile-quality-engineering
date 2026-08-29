import { describe, expect, it } from 'vitest';

import { QualityGateResult } from '../types/gate';

import { generateRecommendations } from './recommendationsEngine';

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

describe('generateRecommendations', () => {
  it('produces no recommendations when every gate passes', () => {
    expect(generateRecommendations([gate({ id: 'p0Failures', status: 'PASS' })])).toEqual([]);
  });

  it('recommends establishing a performance baseline when the gate could not be evaluated', () => {
    const recommendations = generateRecommendations([
      gate({ id: 'performanceRegression', status: 'NOT_EVALUATED' }),
    ]);
    expect(recommendations).toContain(
      'Establish a trusted performance baseline before enforcing the performance regression gate.',
    );
  });

  it('recommends reviewing HIGH product security findings distinctly from dependency findings', () => {
    const recommendations = generateRecommendations([
      gate({ id: 'securityHighProduct', status: 'FAIL' }),
    ]);
    expect(recommendations).toContain(
      'Review the HIGH-severity product security finding(s) before release.',
    );
    expect(recommendations).not.toContain(
      'Upgrade or mitigate the HIGH-severity dependency vulnerabilities reported by npm audit.',
    );
  });
});
