import { StabilityExecutionResult, StabilityMetrics } from '../types/stability';

function countFailuresByCategory(logLines: string[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const line of logLines) {
    try {
      const parsed: unknown = JSON.parse(line);
      const category = (parsed as { classification?: { category?: unknown } }).classification
        ?.category;
      if (typeof category === 'string') {
        counts[category] = (counts[category] ?? 0) + 1;
      }
    } catch {
      continue;
    }
  }

  return counts;
}

export function summarizeStabilityRun(
  executions: StabilityExecutionResult[],
  logLines: string[] = [],
): StabilityMetrics {
  if (executions.length === 0) {
    throw new Error('Cannot summarize stability metrics for zero executions');
  }

  const passedCount = executions.filter((execution) => execution.passed).length;
  const failedCount = executions.length - passedCount;
  const firstExecution = executions.find((execution) => execution.execution === 1);
  const majorityOutcome = passedCount >= failedCount;
  const minorityCount = majorityOutcome ? failedCount : passedCount;

  return {
    executions: executions.length,
    passed: passedCount,
    failed: failedCount,
    firstRunPassRate: firstExecution ? Number(firstExecution.passed) : 0,
    finalPassRate: passedCount / executions.length,
    flakyRate: minorityCount / executions.length,
    failuresByCategory: countFailuresByCategory(logLines),
  };
}
