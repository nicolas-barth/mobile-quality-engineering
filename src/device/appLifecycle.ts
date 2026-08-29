import { browser } from '@wdio/globals';

import { loadEnv } from '../config/env';
import { createModuleLogger } from '../logging/logger';

const logger = createModuleLogger('app-lifecycle');

export async function sendToBackground(durationSeconds: number = 2): Promise<void> {
  logger.info({ durationSeconds }, 'Sending the application to the background');
  await browser.background(durationSeconds);
}

export async function returnToForeground(): Promise<void> {
  const env = loadEnv();
  logger.info('Reactivating the application in the foreground');
  await browser.activateApp(env.androidAppPackage);
}

export async function terminate(): Promise<void> {
  const env = loadEnv();
  logger.info('Terminating the application process');
  await browser.terminateApp(env.androidAppPackage);
}

export async function restart(): Promise<void> {
  logger.info('Restarting the application');
  await terminate();
  await returnToForeground();
}
