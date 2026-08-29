import { PriorityMetric, PriorityMetrics } from '../types/metrics';
import { QualityResult, QualityStatus, TestPriority } from '../types/result';

import { gateableStatus } from './gateableStatus';

function calculateForPriority(results: QualityResult[], priority: TestPriority): PriorityMetric {
  const inPriority = results.filter((result) => result.priority === priority);
  const total = inPriority.length;
  const executed = inPriority.filter(
    (result) => gateableStatus(result) !== QualityStatus.NotExecuted,
  ).length;
  const passed = inPriority.filter(
    (result) => gateableStatus(result) === QualityStatus.Passed,
  ).length;
  const failed = inPriority.filter(
    (result) => gateableStatus(result) === QualityStatus.Failed,
  ).length;
  const passRate = executed > 0 ? passed / executed : 0;

  return { total, executed, passed, failed, passRate };
}

export function calculatePriorityMetrics(results: QualityResult[]): PriorityMetrics {
  return {
    P0: calculateForPriority(results, 'P0'),
    P1: calculateForPriority(results, 'P1'),
    P2: calculateForPriority(results, 'P2'),
    P3: calculateForPriority(results, 'P3'),
  };
}
