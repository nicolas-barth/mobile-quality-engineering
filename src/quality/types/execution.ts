import { QualityResult } from './result';

export type DataMode = 'REAL' | 'SIMULATED';

export interface QualityExecution {
  executionId: string;
  startedAt: string;
  completedAt: string;
  branch?: string;
  commitSha?: string;
  pullRequest?: string;
  appVersion?: string;
  platform: string;
  device?: string;
  androidVersion?: string;
  environment: string;
  trigger: string;
  dataMode: DataMode;
  results: QualityResult[];
}
