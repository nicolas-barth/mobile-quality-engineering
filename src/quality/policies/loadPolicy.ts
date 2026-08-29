import fs from 'node:fs';
import path from 'node:path';

import {
  MissingEvidencePolicyConfig,
  PolicyProfile,
  PolicyProfileName,
  QualityGatesConfig,
  QualityWeightsConfig,
} from '../types/policy';
import { QualityEngineError } from '../validation/errors';

import {
  validateGatesConfig,
  validatePolicyProfile,
  validateProfileStrictness,
  validateWeightsConfig,
} from './validatePolicy';

export interface QualityPolicyBundle {
  gates: QualityGatesConfig;
  weights: QualityWeightsConfig;
  missingEvidence: MissingEvidencePolicyConfig;
  profiles: Record<PolicyProfileName, PolicyProfile>;
}

const PROFILE_NAMES: PolicyProfileName[] = ['PR', 'MAIN', 'NIGHTLY', 'RELEASE'];
const PROFILE_FILE_NAMES: Record<PolicyProfileName, string> = {
  PR: 'pr-policy.json',
  MAIN: 'main-policy.json',
  NIGHTLY: 'nightly-policy.json',
  RELEASE: 'release-policy.json',
};

function readJson<T>(filePath: string, label: string): T {
  if (!fs.existsSync(filePath)) {
    throw new QualityEngineError(`Required quality policy file is missing: ${label}`);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch (error) {
    throw new QualityEngineError(`Could not parse quality policy file: ${label}`, error);
  }
}

export function loadQualityPolicies(root: string = process.cwd()): QualityPolicyBundle {
  const configDir = path.join(root, 'config', 'quality');

  const gates = readJson<QualityGatesConfig>(
    path.join(configDir, 'quality-gates.json'),
    'config/quality/quality-gates.json',
  );
  const weights = readJson<QualityWeightsConfig>(
    path.join(configDir, 'quality-weights.json'),
    'config/quality/quality-weights.json',
  );
  const missingEvidence = readJson<MissingEvidencePolicyConfig>(
    path.join(configDir, 'missing-evidence-policy.json'),
    'config/quality/missing-evidence-policy.json',
  );

  const profiles = {} as Record<PolicyProfileName, PolicyProfile>;
  for (const name of PROFILE_NAMES) {
    profiles[name] = readJson<PolicyProfile>(
      path.join(configDir, PROFILE_FILE_NAMES[name]),
      `config/quality/${PROFILE_FILE_NAMES[name]}`,
    );
  }

  const errors = [
    ...validateGatesConfig(gates),
    ...validateWeightsConfig(weights),
    ...PROFILE_NAMES.flatMap((name) =>
      validatePolicyProfile(profiles[name], new Set(Object.keys(gates))),
    ),
    ...validateProfileStrictness(profiles),
  ];

  if (errors.length > 0) {
    throw new QualityEngineError(`Invalid quality policy configuration:\n- ${errors.join('\n- ')}`);
  }

  return { gates, weights, missingEvidence, profiles };
}

export function resolvePolicyProfile(
  profileName: PolicyProfileName,
  root: string = process.cwd(),
): { profile: PolicyProfile; policies: QualityPolicyBundle } {
  const policies = loadQualityPolicies(root);
  return { profile: policies.profiles[profileName], policies };
}
