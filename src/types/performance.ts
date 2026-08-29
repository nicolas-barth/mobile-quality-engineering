export interface FunctionalTiming {
  operation: string;
  durationMs: number;
}

export interface FunctionalTimingSummary {
  device: string;
  platformVersion: string;
  timings: FunctionalTiming[];
}
