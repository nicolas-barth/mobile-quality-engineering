import { FailureCategory } from '../../types/failure';
import { QualityResult, QualityStatus } from '../types/result';

export const ENVIRONMENT_LIKE_CATEGORIES = new Set<FailureCategory>([
  FailureCategory.EnvironmentFailure,
  FailureCategory.InfrastructureFailure,
  FailureCategory.DeviceFailure,
]);

export function gateableStatus(result: QualityResult): QualityStatus {
  if (
    result.status === QualityStatus.Failed &&
    result.failureCategory !== undefined &&
    ENVIRONMENT_LIKE_CATEGORIES.has(result.failureCategory)
  ) {
    return QualityStatus.NotExecuted;
  }
  return result.status;
}
