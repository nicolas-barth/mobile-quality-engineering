import { FailureCategory } from '../../types/failure';
import { MonkeyRunResult, StabilityMetrics } from '../../types/stability';
import { ReliabilityMetrics } from '../types/metrics';
import { QualityResult, QualityStatus } from '../types/result';

import { ENVIRONMENT_LIKE_CATEGORIES } from './gateableStatus';

export function calculateReliabilityMetrics(
  results: QualityResult[],
  stabilitySummary?: StabilityMetrics,
  monkeyResult?: MonkeyRunResult,
): ReliabilityMetrics {
  const failedResults = results.filter((result) => result.status === QualityStatus.Failed);
  const classifiedFailures = failedResults.filter((result) => result.failureCategory !== undefined);

  const environmentFailureRate =
    classifiedFailures.length > 0
      ? classifiedFailures.filter((result) =>
          ENVIRONMENT_LIKE_CATEGORIES.has(result.failureCategory!),
        ).length / classifiedFailures.length
      : 0;

  const automationFailureRate =
    classifiedFailures.length > 0
      ? classifiedFailures.filter(
          (result) => result.failureCategory === FailureCategory.AutomationDefect,
        ).length / classifiedFailures.length
      : 0;

  return {
    firstRunPassRate: stabilitySummary?.firstRunPassRate ?? null,
    finalPassRate: stabilitySummary?.finalPassRate ?? null,
    retryRecoveryRate: null,
    flakyRate: stabilitySummary?.flakyRate ?? null,
    crashCount: monkeyResult?.crashDetected === true ? 1 : 0,
    anrCount: monkeyResult?.anrDetected === true ? 1 : 0,
    environmentFailureRate,
    automationFailureRate,
    hasStabilityEvidence: stabilitySummary !== undefined,
  };
}
