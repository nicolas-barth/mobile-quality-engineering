import { describe, expect, it } from 'vitest';

import { FailureCategory } from '../types/failure';

import { classifyFailure } from './failureClassifier';

describe('classifyFailure', () => {
  it('classifies a missing Android SDK as an environment failure', () => {
    const result = classifyFailure({
      name: 'Error',
      message: 'Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported',
    });
    expect(result.category).toBe(FailureCategory.EnvironmentFailure);
    expect(result.confidence).toBe('high');
  });

  it('classifies a refused Appium connection as an infrastructure failure', () => {
    const result = classifyFailure({
      name: 'Error',
      message: 'connect ECONNREFUSED 127.0.0.1:4723',
    });
    expect(result.category).toBe(FailureCategory.InfrastructureFailure);
  });

  it('classifies an unreachable Appium server as an infrastructure failure', () => {
    const result = classifyFailure({
      name: 'Error',
      message:
        'Unable to connect to "http://127.0.0.1:4723/", make sure browser driver is running on that address. It seems like the service failed to start or is rejecting any connections.',
    });
    expect(result.category).toBe(FailureCategory.InfrastructureFailure);
  });

  it('classifies an offline device as a device failure', () => {
    const result = classifyFailure({ name: 'Error', message: 'adb: device offline' });
    expect(result.category).toBe(FailureCategory.DeviceFailure);
  });

  it('classifies an invalid selector strategy as an automation defect', () => {
    const result = classifyFailure({ name: 'Error', message: 'Invalid selector strategy: foo' });
    expect(result.category).toBe(FailureCategory.AutomationDefect);
  });

  it('classifies a generic element timeout as an automation defect with medium confidence', () => {
    const result = classifyFailure({
      name: 'Error',
      message: 'Product catalog was not displayed after application launch: Timeout',
    });
    expect(result.category).toBe(FailureCategory.AutomationDefect);
    expect(result.confidence).toBe('medium');
  });

  it('does not default a plain assertion failure to a product defect', () => {
    const result = classifyFailure({
      name: 'AssertionError',
      message: 'expected true to equal false',
    });
    expect(result.category).toBe(FailureCategory.Unclassified);
    expect(result.confidence).toBe('low');
  });
});
