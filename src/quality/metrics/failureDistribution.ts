import { FailureCategory } from '../../types/failure';
import { FailureDistribution } from '../types/metrics';
import { QualityResult } from '../types/result';

export function calculateFailureDistribution(results: QualityResult[]): FailureDistribution {
  const classified = results.filter((result) => result.failureCategory !== undefined);
  const total = classified.length;

  const distribution = {} as FailureDistribution;
  for (const category of Object.values(FailureCategory)) {
    const count = classified.filter((result) => result.failureCategory === category).length;
    distribution[category] = {
      count,
      percentage: total > 0 ? count / total : 0,
    };
  }

  return distribution;
}
