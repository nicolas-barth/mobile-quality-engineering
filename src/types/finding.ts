export enum FindingSeverity {
  Info = 'INFO',
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Critical = 'CRITICAL',
}

export type FindingCategory =
  'accessibility' | 'compatibility' | 'security' | 'performance' | 'visual' | 'stability';

export type FindingStatus = 'open' | 'confirmed' | 'testability-issue' | 'not-a-defect';

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  evidence?: string;
  environment?: string;
  reproducibility?: 'always' | 'intermittent' | 'unobserved';
  status: FindingStatus;
}
