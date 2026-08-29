import { FailureCategory, FailureClassification } from '../types/failure';

interface ClassificationRule {
  category: FailureCategory;
  confidence: FailureClassification['confidence'];
  reason: string;
  matches: (message: string) => boolean;
}

const RULES: ClassificationRule[] = [
  {
    category: FailureCategory.EnvironmentFailure,
    confidence: 'high',
    reason: 'Android SDK location is not configured for this run',
    matches: (message) => /android_home|android_sdk_root/i.test(message),
  },
  {
    category: FailureCategory.EnvironmentFailure,
    confidence: 'high',
    reason: 'The application under test could not be found at the configured path',
    matches: (message) => /\.apk['"]?\s+(does not exist|not found)|enoent.*\.apk/i.test(message),
  },
  {
    category: FailureCategory.InfrastructureFailure,
    confidence: 'high',
    reason: 'The Appium server could not be reached',
    matches: (message) =>
      /econnrefused|econnreset|could not start a new session|failed to create session|unable to connect to|service failed to start/i.test(
        message,
      ),
  },
  {
    category: FailureCategory.DeviceFailure,
    confidence: 'high',
    reason: 'The device or emulator reported an ADB-level failure',
    matches: (message) =>
      /device offline|device not found|no devices\/emulators found|install_failed/i.test(message),
  },
  {
    category: FailureCategory.AutomationDefect,
    confidence: 'high',
    reason: 'The selector strategy used by the test is invalid',
    matches: (message) => /invalid selector|unsupported selector strategy/i.test(message),
  },
  {
    category: FailureCategory.TestDataFailure,
    confidence: 'medium',
    reason: 'The test relied on data that was not available in this run',
    matches: (message) => /no product titles were found|fixture|test data/i.test(message),
  },
  {
    category: FailureCategory.AutomationDefect,
    confidence: 'medium',
    reason: 'An expected element never appeared within the configured timeout',
    matches: (message) => /timeout|wait for.*to be displayed|timed out/i.test(message),
  },
];

export function classifyFailure(error: Pick<Error, 'name' | 'message'>): FailureClassification {
  const message = `${error.name} ${error.message}`;

  for (const rule of RULES) {
    if (rule.matches(message)) {
      return { category: rule.category, confidence: rule.confidence, reason: rule.reason };
    }
  }

  return {
    category: FailureCategory.Unclassified,
    confidence: 'low',
    reason: 'No heuristic matched this failure; manual triage is required',
  };
}
