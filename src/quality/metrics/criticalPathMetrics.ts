import { CategoryMetric } from '../types/metrics';
import { QualityResult, QualityStatus } from '../types/result';

import { gateableStatus } from './gateableStatus';

export function calculateCriticalPathMetrics(results: QualityResult[]): CategoryMetric {
  const criticalPathResults = results.filter((result) => result.criticalPath === true);
  const notExecuted = criticalPathResults.filter(
    (result) => gateableStatus(result) === QualityStatus.NotExecuted,
  ).length;
  const executed = criticalPathResults.length - notExecuted;
  const passed = criticalPathResults.filter(
    (result) => gateableStatus(result) === QualityStatus.Passed,
  ).length;
  const failed = criticalPathResults.filter(
    (result) => gateableStatus(result) === QualityStatus.Failed,
  ).length;
  const passRate = executed > 0 ? passed / executed : 0;

  return { executed, passed, failed, notExecuted, passRate };
}
