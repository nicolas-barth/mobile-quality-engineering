import fs from 'node:fs';
import path from 'node:path';

import { browser } from '@wdio/globals';

import { collectDeviceInfo } from '../device/deviceInfo';
import { createModuleLogger } from '../logging/logger';
import { EvidenceCaptureResult, EvidenceContext } from '../types/evidence';
import { ensureDirectory, resolveFromRoot, sanitizeForFileSystem } from '../utils/paths';

import { collectLogcat, getForegroundActivity } from './adbService';

const logger = createModuleLogger('evidence-service');

export async function captureFailureEvidence(
  context: EvidenceContext,
): Promise<EvidenceCaptureResult> {
  const directory = resolveFromRoot(
    'evidence',
    context.runTimestamp,
    sanitizeForFileSystem(context.testName),
  );
  ensureDirectory(directory);

  const result: EvidenceCaptureResult = {
    directory,
    screenshotCaptured: false,
    pageSourceCaptured: false,
    deviceInfoCaptured: false,
    errorCaptured: false,
    logcatCaptured: false,
  };

  try {
    await browser.saveScreenshot(path.join(directory, 'screenshot.png'));
    result.screenshotCaptured = true;
  } catch (captureError) {
    logger.warn({ err: captureError }, 'Failed to capture screenshot evidence');
  }

  try {
    const pageSource = await browser.getPageSource();
    fs.writeFileSync(path.join(directory, 'page-source.xml'), pageSource);
    result.pageSourceCaptured = true;
  } catch (captureError) {
    logger.warn({ err: captureError }, 'Failed to capture page source evidence');
  }

  try {
    const deviceInfo = await collectDeviceInfo();
    const foregroundActivity = await getForegroundActivity().catch((activityError: unknown) => {
      logger.warn({ err: activityError }, 'Could not determine the foreground activity');
      return null;
    });
    fs.writeFileSync(
      path.join(directory, 'device.json'),
      JSON.stringify({ ...deviceInfo, foregroundActivity }, null, 2),
    );
    result.deviceInfoCaptured = true;
  } catch (captureError) {
    logger.warn({ err: captureError }, 'Failed to capture device information evidence');
  }

  try {
    const logcat = await collectLogcat();
    if (logcat !== null) {
      fs.writeFileSync(path.join(directory, 'logcat.txt'), logcat);
      result.logcatCaptured = true;
    }
  } catch (captureError) {
    logger.warn({ err: captureError }, 'Failed to capture logcat evidence');
  }

  if (context.error) {
    try {
      fs.writeFileSync(
        path.join(directory, 'error.json'),
        JSON.stringify(
          {
            testName: context.testName,
            timestamp: context.runTimestamp,
            message: context.error.message,
            stack: context.error.stack,
          },
          null,
          2,
        ),
      );
      result.errorCaptured = true;
    } catch (captureError) {
      logger.warn({ err: captureError }, 'Failed to write error evidence');
    }
  }

  logger.info({ result }, 'Evidence capture completed');
  return result;
}
