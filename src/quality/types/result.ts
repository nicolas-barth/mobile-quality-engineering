import { FailureCategory } from '../../types/failure';

export enum QualitySource {
  Wdio = 'WDIO',
  Junit = 'JUNIT',
  Stability = 'STABILITY',
  Accessibility = 'ACCESSIBILITY',
  Visual = 'VISUAL',
  Security = 'SECURITY',
  Performance = 'PERFORMANCE',
  Installation = 'INSTALLATION',
  Compatibility = 'COMPATIBILITY',
  Manual = 'MANUAL',
}

export enum QualityCategory {
  Functional = 'FUNCTIONAL',
  DeviceBehavior = 'DEVICE_BEHAVIOR',
  Accessibility = 'ACCESSIBILITY',
  Visual = 'VISUAL',
  Installation = 'INSTALLATION',
  Upgrade = 'UPGRADE',
  Compatibility = 'COMPATIBILITY',
  Stability = 'STABILITY',
  Performance = 'PERFORMANCE',
  MobileWeb = 'MOBILE_WEB',
  Security = 'SECURITY',
  Unknown = 'UNKNOWN',
}

export enum QualityStatus {
  Passed = 'PASSED',
  Failed = 'FAILED',
  Skipped = 'SKIPPED',
  Blocked = 'BLOCKED',
  NotExecuted = 'NOT_EXECUTED',
  Warning = 'WARNING',
}

export type TestPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface EnvironmentMetadata {
  platform?: string;
  device?: string;
  androidVersion?: string;
  environment?: string;
  compatibilityProfile?: string;
}

export type EvidenceKind =
  'screenshot' | 'logcat' | 'page-source' | 'device-info' | 'error' | 'report';

export interface EvidenceReference {
  kind: EvidenceKind;
  path: string;
}

export interface QualityResult {
  id: string;
  executionId: string;
  timestamp: string;
  source: QualitySource;
  category: QualityCategory;
  suite: string;
  test?: string;
  status: QualityStatus;
  priority?: TestPriority;
  criticalPath?: boolean;
  durationMs?: number;
  retryCount?: number;
  failureCategory?: FailureCategory;
  failureMessage?: string;
  environment?: EnvironmentMetadata;
  evidence?: EvidenceReference[];
  traceId?: string;
}
