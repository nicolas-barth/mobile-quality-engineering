export interface StabilityExecutionResult {
  execution: number;
  passed: boolean;
  exitCode: number;
  durationSeconds: number;
  timestamp: string;
}

export interface StabilityMetrics {
  executions: number;
  passed: number;
  failed: number;
  firstRunPassRate: number;
  finalPassRate: number;
  flakyRate: number;
  failuresByCategory: Record<string, number>;
}

export interface MonkeyRunOptions {
  packageName: string;
  eventCount: number;
  seed: number;
  throttleMs: number;
}

export interface MonkeyRunResult {
  packageName: string;
  seed: number;
  eventCount: number;
  exitCode: number;
  crashDetected: boolean;
  anrDetected: boolean;
  output: string;
}
