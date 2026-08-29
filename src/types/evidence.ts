export interface EvidenceContext {
  testName: string;
  runTimestamp: string;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface EvidenceCaptureResult {
  directory: string;
  screenshotCaptured: boolean;
  pageSourceCaptured: boolean;
  deviceInfoCaptured: boolean;
  errorCaptured: boolean;
  logcatCaptured: boolean;
}
