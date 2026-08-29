import { DataMode } from './execution';
import { QualityGateResult } from './gate';
import { QualityMetrics } from './metrics';
import { PolicyProfileName } from './policy';
import { ResidualRisk } from './risk';
import { QualityDimensionScore } from './score';

export enum ReleaseDecision {
  Go = 'GO',
  ConditionalGo = 'CONDITIONAL_GO',
  NoGo = 'NO_GO',
}

export const RELEASE_DECISION_LABEL: Record<ReleaseDecision, string> = {
  [ReleaseDecision.Go]: 'GO',
  [ReleaseDecision.ConditionalGo]: 'CONDITIONAL GO',
  [ReleaseDecision.NoGo]: 'NO-GO',
};

export type AssessmentConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ReleaseIssue {
  code: string;
  message: string;
  category: string;
  gateId?: string;
  traceId?: string;
}

export const QUALITY_SCHEMA_VERSION = '1.0';

export interface ReleaseAssessment {
  schemaVersion: string;
  releaseId: string;
  generatedAt: string;
  dataMode: DataMode;
  appVersion?: string;
  commitSha?: string;
  branch?: string;
  environment: string;
  policyProfile: PolicyProfileName;
  decision: ReleaseDecision;
  decisionLabel: string;
  confidence: AssessmentConfidence;
  score: number;
  minimumScore: number;
  gates: QualityGateResult[];
  metrics: QualityMetrics;
  dimensions: QualityDimensionScore[];
  risk: ResidualRisk;
  blockers: ReleaseIssue[];
  warnings: ReleaseIssue[];
  conditions: string[];
  recommendations: string[];
}
