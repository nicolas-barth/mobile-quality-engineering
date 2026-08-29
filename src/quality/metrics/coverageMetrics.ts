import { TraceabilityEntry } from '../collectors/traceability';
import { CoverageMetrics } from '../types/metrics';
import { QualityResult, QualitySource, QualityStatus } from '../types/result';

export function calculateCoverageMetrics(
  results: QualityResult[],
  traceabilityEntries: TraceabilityEntry[],
): CoverageMetrics {
  const implemented = traceabilityEntries.length;

  const statusesByTraceId = new Map<string, QualityStatus[]>();
  for (const result of results) {
    if (result.traceId === undefined) {
      continue;
    }
    const existing = statusesByTraceId.get(result.traceId) ?? [];
    existing.push(result.status);
    statusesByTraceId.set(result.traceId, existing);
  }

  let executed = 0;
  let blocked = 0;
  for (const statuses of statusesByTraceId.values()) {
    if (statuses.some((status) => status === QualityStatus.Blocked)) {
      blocked += 1;
      continue;
    }
    if (statuses.some((status) => status !== QualityStatus.NotExecuted)) {
      executed += 1;
    }
  }

  const manualOnly = results.filter(
    (result) =>
      result.source === QualitySource.Manual && result.status !== QualityStatus.NotExecuted,
  ).length;

  const executedCoverageRate = implemented > 0 ? executed / implemented : 0;

  return { implemented, executed, blocked, manualOnly, executedCoverageRate };
}
