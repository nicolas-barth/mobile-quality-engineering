import { ExecutionMetrics } from '../types/metrics';
import { QualityResult, QualityStatus } from '../types/result';

function countByStatus(results: QualityResult[], status: QualityStatus): number {
  return results.filter((result) => result.status === status).length;
}

export function calculateExecutionMetrics(results: QualityResult[]): ExecutionMetrics {
  const total = results.length;
  const passed = countByStatus(results, QualityStatus.Passed);
  const failed = countByStatus(results, QualityStatus.Failed);
  const skipped = countByStatus(results, QualityStatus.Skipped);
  const blocked = countByStatus(results, QualityStatus.Blocked);
  const notExecuted = countByStatus(results, QualityStatus.NotExecuted);
  const warnings = countByStatus(results, QualityStatus.Warning);

  const executed = total - notExecuted;
  const passRate = executed > 0 ? passed / executed : 0;
  const executionRate = total > 0 ? executed / total : 0;

  const timedResults = results.filter((result) => result.durationMs !== undefined);
  const totalDurationMs = timedResults.reduce((sum, result) => sum + (result.durationMs ?? 0), 0);
  const averageDurationMs = timedResults.length > 0 ? totalDurationMs / timedResults.length : 0;

  return {
    total,
    passed,
    failed,
    skipped,
    blocked,
    notExecuted,
    warnings,
    passRate,
    executionRate,
    averageDurationMs,
    totalDurationMs,
  };
}
