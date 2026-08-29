export type PolicyProfileName = 'PR' | 'MAIN' | 'NIGHTLY' | 'RELEASE';

export type MissingEvidenceBehavior = 'IGNORE' | 'WARNING' | 'BLOCK' | 'NOT_EVALUATED';

export interface GateThreshold {
  min?: number;
  max?: number;
  blocking: boolean;
  description: string;
}

export type QualityGatesConfig = Record<string, GateThreshold>;

export interface QualityWeightsConfig {
  description: string;
  weights: Record<string, number>;
}

export interface MissingEvidencePolicyConfig {
  description: string;
  categories: Record<string, MissingEvidenceBehavior>;
  manualEvidence: Record<string, MissingEvidenceBehavior>;
}

export interface GateOverride {
  blocking?: boolean;
}

export interface PolicyProfile {
  profile: PolicyProfileName;
  description: string;
  requiredCategories: string[];
  enabledGates: string[];
  missingEvidenceOverrides: Record<string, MissingEvidenceBehavior>;
  gateOverrides: Record<string, GateOverride>;
  mandatoryCompatibilityProfiles: string[];
  minimumScore: number;
  conditionalGoExitCode: 0 | 1;
}
