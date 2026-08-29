export type TrendClassification = 'IMPROVED' | 'STABLE' | 'REGRESSED' | 'NOT_COMPARABLE';

export interface TrendMetricComparison {
  metric: string;
  previous: number | null;
  current: number | null;
  delta: number | null;
  classification: TrendClassification;
}

export interface TrendReport {
  comparable: boolean;
  previousReleaseId?: string;
  previousAppVersion?: string;
  comparisons: TrendMetricComparison[];
  regressions: string[];
}

export interface QualitySnapshot {
  schemaVersion: string;
  releaseId: string;
  generatedAt: string;
  appVersion?: string;
  decision: string;
  score: number;
  confidence: string;
  passRate: number;
  criticalPathPassRate: number | null;
  flakyRate: number | null;
  crashCount: number;
  anrCount: number;
  securityCritical: number;
  securityHigh: number;
  accessibilityCritical: number;
  visualFailures: number;
  executedCoverageRate: number;
}
