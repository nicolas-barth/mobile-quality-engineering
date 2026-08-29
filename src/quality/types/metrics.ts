import { FailureCategory } from '../../types/failure';

export interface ExecutionMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  blocked: number;
  notExecuted: number;
  warnings: number;
  passRate: number;
  executionRate: number;
  averageDurationMs: number;
  totalDurationMs: number;
}

export interface PriorityMetric {
  total: number;
  executed: number;
  passed: number;
  failed: number;
  passRate: number;
}

export type PriorityMetrics = Record<'P0' | 'P1' | 'P2' | 'P3', PriorityMetric>;

export interface CategoryMetric {
  executed: number;
  passed: number;
  failed: number;
  notExecuted: number;
  passRate: number;
}

export type CategoryMetrics = Record<string, CategoryMetric>;

export interface ReliabilityMetrics {
  firstRunPassRate: number | null;
  finalPassRate: number | null;
  retryRecoveryRate: number | null;
  flakyRate: number | null;
  crashCount: number;
  anrCount: number;
  environmentFailureRate: number;
  automationFailureRate: number;
  hasStabilityEvidence: boolean;
}

export interface FailureDistributionEntry {
  count: number;
  percentage: number;
}

export type FailureDistribution = Record<FailureCategory, FailureDistributionEntry>;

export interface CoverageMetrics {
  implemented: number;
  executed: number;
  blocked: number;
  manualOnly: number;
  executedCoverageRate: number;
}

export interface QualityMetrics {
  execution: ExecutionMetrics;
  priority: PriorityMetrics;
  category: CategoryMetrics;
  criticalPath: CategoryMetric;
  reliability: ReliabilityMetrics;
  failureDistribution: FailureDistribution;
  coverage: CoverageMetrics;
}
