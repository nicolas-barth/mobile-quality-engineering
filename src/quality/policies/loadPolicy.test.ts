import { describe, expect, it } from 'vitest';

import { loadQualityPolicies } from './loadPolicy';

describe('loadQualityPolicies (real repository configuration)', () => {
  it('loads and validates the real config/quality/*.json files without error', () => {
    const policies = loadQualityPolicies(process.cwd());

    expect(Object.values(policies.weights.weights).reduce((sum, weight) => sum + weight, 0)).toBe(
      100,
    );
    expect(policies.profiles.PR.profile).toBe('PR');
    expect(policies.profiles.RELEASE.profile).toBe('RELEASE');
    expect(policies.profiles.RELEASE.minimumScore).toBeGreaterThanOrEqual(
      policies.profiles.PR.minimumScore,
    );
  });
});
