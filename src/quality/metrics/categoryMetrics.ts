import { CategoryMetric, CategoryMetrics } from '../types/metrics';
import { QualityCategory, QualityResult, QualityStatus } from '../types/result';

import { gateableStatus } from './gateableStatus';

export function calculateCategoryMetrics(results: QualityResult[]): CategoryMetrics {
  const metrics: CategoryMetrics = {};

  for (const category of Object.values(QualityCategory)) {
    const inCategory = results.filter((result) => result.category === category);
    if (inCategory.length === 0) {
      continue;
    }

    const notExecuted = inCategory.filter(
      (result) => gateableStatus(result) === QualityStatus.NotExecuted,
    ).length;
    const executed = inCategory.length - notExecuted;
    const passed = inCategory.filter(
      (result) => gateableStatus(result) === QualityStatus.Passed,
    ).length;
    const failed = inCategory.filter(
      (result) => gateableStatus(result) === QualityStatus.Failed,
    ).length;
    const passRate = executed > 0 ? passed / executed : 0;

    const entry: CategoryMetric = { executed, passed, failed, notExecuted, passRate };
    metrics[category] = entry;
  }

  return metrics;
}
