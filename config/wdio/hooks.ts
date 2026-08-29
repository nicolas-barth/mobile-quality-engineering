import allureReporter from '@wdio/allure-reporter';
import { browser } from '@wdio/globals';
import type { Frameworks } from '@wdio/types';

import { isInstalled } from '../../src/device/appState';
import { collectDeviceInfo } from '../../src/device/deviceInfo';
import { restorePortrait } from '../../src/device/orientation';
import { resetToKnownState } from '../../src/flows/resetFlow';
import { createModuleLogger } from '../../src/logging/logger';
import {
  attachDeviceInfo,
  attachError,
  attachLogcat,
  attachScreenshot,
} from '../../src/reporters/allureAttachments';
import {
  collectLogcat,
  getAndroidVersion,
  getAppVersionName,
  getDeviceModel,
  isDeviceConnected,
} from '../../src/services/adbService';
import { captureFailureEvidence } from '../../src/services/evidenceService';
import { determineResetTier } from '../../src/services/testStateService';
import { classifyFailure } from '../../src/utils/failureClassifier';
import { createRunTimestamp } from '../../src/utils/paths';

const logger = createModuleLogger('wdio-hooks');

export const runTimestamp = createRunTimestamp();

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error('Test failed without a captured error');
}

export async function reportBeforeSession(): Promise<void> {
  logger.info('Validating application state before suite execution');

  if (!(await isDeviceConnected())) {
    throw new Error('No Android device or emulator is connected to run the suite against');
  }

  if (!(await isInstalled())) {
    throw new Error('The application under test is not installed on the target device');
  }

  const deviceInfo = await collectDeviceInfo();
  logger.info({ deviceInfo }, 'Application confirmed installed, session ready');

  try {
    const [deviceModel, androidVersion, appVersion] = await Promise.all([
      getDeviceModel(),
      getAndroidVersion(),
      getAppVersionName(deviceInfo.appPackage),
    ]);
    logger.info({ deviceModel, androidVersion, appVersion }, 'Collected ADB device diagnostics');
  } catch (diagnosticsError) {
    logger.warn({ err: diagnosticsError }, 'Could not collect ADB device diagnostics');
  }

  await restorePortrait();
}

export function reportRunSummary(
  exitCode: number,
  _config: unknown,
  _capabilities: unknown,
  results: unknown,
): void {
  logger.info({ exitCode, results }, 'Test run finished');
}

export async function reportBeforeTest(test: Frameworks.Test): Promise<void> {
  const tier = determineResetTier(test.file);
  logger.info({ test: test.title, tier }, 'Preparing application state before test');
  await resetToKnownState(tier);
}

export async function reportAfterTest(
  test: Frameworks.Test,
  _context: unknown,
  results: Frameworks.TestResult,
): Promise<void> {
  const deviceInfo = await collectDeviceInfo();
  await attachDeviceInfo(deviceInfo);

  const screenshot = await browser.takeScreenshot();
  await attachScreenshot(`${test.title} - final state`, screenshot);

  if (results.retries.attempts > 0) {
    logger.info(
      { test: test.title, attempts: results.retries.attempts, passed: results.passed },
      'Test required a retry',
    );
    await allureReporter.addAttachment(
      'Retry information',
      JSON.stringify(
        {
          attempts: results.retries.attempts,
          limit: results.retries.limit,
          finalResultPassed: results.passed,
        },
        null,
        2,
      ),
      'application/json',
    );
  }

  if (!results.passed) {
    const error = toError(results.error);
    await attachError(error);

    const logcat = await collectLogcat();
    if (logcat !== null) {
      await attachLogcat(logcat);
    }

    const classification = classifyFailure(error);
    await allureReporter.addAttachment(
      'Failure classification',
      JSON.stringify(classification, null, 2),
      'application/json',
    );

    const captureResult = await captureFailureEvidence({
      testName: test.fullTitle,
      runTimestamp,
      error: { message: error.message, stack: error.stack },
    });

    logger.error(
      { test: test.title, evidence: captureResult.directory, classification },
      'Test failed',
    );
  }
}
