import { PolicyProfile, QualityGatesConfig, QualityWeightsConfig } from '../types/policy';

const RATE_GATE_IDS = new Set([
  'criticalPathPassRate',
  'functionalPassRate',
  'flakyRate',
  'performanceRegression',
  'installationCriticalPassRate',
]);

export function validateGatesConfig(gates: QualityGatesConfig): string[] {
  const errors: string[] = [];

  for (const [id, threshold] of Object.entries(gates)) {
    if (threshold.min === undefined && threshold.max === undefined) {
      errors.push(`Gate "${id}" defines neither min nor max`);
    }

    const bounds = [threshold.min, threshold.max].filter(
      (bound): bound is number => bound !== undefined,
    );
    if (RATE_GATE_IDS.has(id)) {
      for (const bound of bounds) {
        if (bound < 0 || bound > 1) {
          errors.push(
            `Gate "${id}" is a rate gate; its threshold must be between 0 and 1, got ${bound}`,
          );
        }
      }
    } else {
      for (const bound of bounds) {
        if (bound < 0) {
          errors.push(
            `Gate "${id}" is a count gate; its threshold must be non-negative, got ${bound}`,
          );
        }
      }
    }

    if (typeof threshold.blocking !== 'boolean') {
      errors.push(`Gate "${id}" is missing a boolean "blocking" flag`);
    }
    if (threshold.description === undefined || threshold.description.trim().length === 0) {
      errors.push(`Gate "${id}" is missing a documented description`);
    }
  }

  return errors;
}

export function validateWeightsConfig(config: QualityWeightsConfig): string[] {
  const errors: string[] = [];
  const entries = Object.entries(config.weights);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

  if (total !== 100) {
    errors.push(`Quality dimension weights must sum to exactly 100, got ${total}`);
  }

  for (const [category, weight] of entries) {
    if (weight < 0) {
      errors.push(`Weight for "${category}" must be non-negative, got ${weight}`);
    }
  }

  return errors;
}

export function validatePolicyProfile(profile: PolicyProfile, knownGateIds: Set<string>): string[] {
  const errors: string[] = [];

  if (profile.minimumScore < 0 || profile.minimumScore > 100) {
    errors.push(`Policy "${profile.profile}" minimumScore must be between 0 and 100`);
  }

  for (const gateId of profile.enabledGates) {
    if (!knownGateIds.has(gateId)) {
      errors.push(`Policy "${profile.profile}" references unknown gate id "${gateId}"`);
    }
  }

  for (const gateId of Object.keys(profile.gateOverrides)) {
    if (!knownGateIds.has(gateId)) {
      errors.push(`Policy "${profile.profile}" overrides unknown gate id "${gateId}"`);
    }
  }

  if (profile.conditionalGoExitCode !== 0 && profile.conditionalGoExitCode !== 1) {
    errors.push(`Policy "${profile.profile}" conditionalGoExitCode must be 0 or 1`);
  }

  return errors;
}

export function validateProfileStrictness(profiles: {
  PR: PolicyProfile;
  MAIN: PolicyProfile;
  NIGHTLY: PolicyProfile;
  RELEASE: PolicyProfile;
}): string[] {
  const errors: string[] = [];

  if (profiles.RELEASE.minimumScore < profiles.PR.minimumScore) {
    errors.push('RELEASE minimumScore must be at least as strict as PR minimumScore');
  }
  if (profiles.RELEASE.requiredCategories.length < profiles.PR.requiredCategories.length) {
    errors.push('RELEASE must require at least as many evidence categories as PR');
  }

  return errors;
}
