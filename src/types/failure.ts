export enum FailureCategory {
  ProductDefect = 'PRODUCT_DEFECT',
  AutomationDefect = 'AUTOMATION_DEFECT',
  EnvironmentFailure = 'ENVIRONMENT_FAILURE',
  DeviceFailure = 'DEVICE_FAILURE',
  TestDataFailure = 'TEST_DATA_FAILURE',
  InfrastructureFailure = 'INFRASTRUCTURE_FAILURE',
  Unclassified = 'UNCLASSIFIED',
}

export type FailureConfidence = 'high' | 'medium' | 'low';

export interface FailureClassification {
  category: FailureCategory;
  confidence: FailureConfidence;
  reason: string;
}
