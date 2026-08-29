import { MonkeyRunResult, StabilityMetrics } from '../../types/stability';
import { TraceabilityEntry } from '../collectors/traceability';
import { QualityMetrics } from '../types/metrics';
import { QualityResult } from '../types/result';

import { calculateCategoryMetrics } from './categoryMetrics';
import { calculateCoverageMetrics } from './coverageMetrics';
import { calculateCriticalPathMetrics } from './criticalPathMetrics';
import { calculateExecutionMetrics } from './executionMetrics';
import { calculateFailureDistribution } from './failureDistribution';
import { calculatePriorityMetrics } from './priorityMetrics';
import { calculateReliabilityMetrics } from './reliabilityMetrics';

export interface BuildMetricsInput {
  results: QualityResult[];
  traceabilityEntries: TraceabilityEntry[];
  stabilitySummary?: StabilityMetrics;
  monkeyResult?: MonkeyRunResult;
}

export function buildQualityMetrics(input: BuildMetricsInput): QualityMetrics {
  return {
    execution: calculateExecutionMetrics(input.results),
    priority: calculatePriorityMetrics(input.results),
    category: calculateCategoryMetrics(input.results),
    criticalPath: calculateCriticalPathMetrics(input.results),
    reliability: calculateReliabilityMetrics(
      input.results,
      input.stabilitySummary,
      input.monkeyResult,
    ),
    failureDistribution: calculateFailureDistribution(input.results),
    coverage: calculateCoverageMetrics(input.results, input.traceabilityEntries),
  };
}

export * from './categoryMetrics';
export * from './coverageMetrics';
export * from './criticalPathMetrics';
export * from './executionMetrics';
export * from './failureDistribution';
export * from './priorityMetrics';
export * from './reliabilityMetrics';
