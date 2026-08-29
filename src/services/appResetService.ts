import { browser } from '@wdio/globals';

import { loadEnv } from '../config/env';
import * as appLifecycle from '../device/appLifecycle';
import { hideKeyboard } from '../device/keyboard';
import { restorePortrait } from '../device/orientation';
import { revoke } from '../device/permissions';
import { createModuleLogger } from '../logging/logger';

import { clearAppData } from './adbService';

const logger = createModuleLogger('app-reset-service');

export async function lightweightReset(): Promise<void> {
  logger.info('Applying a lightweight reset');
  await hideKeyboard();
  await restorePortrait();
  await appLifecycle.returnToForeground();
}

export async function applicationReset(): Promise<void> {
  const env = loadEnv();
  logger.info('Applying an application reset');
  await appLifecycle.terminate();
  await clearAppData(env.androidAppPackage);
  await appLifecycle.returnToForeground();
}

export async function cleanInstallation(): Promise<void> {
  const env = loadEnv();
  logger.info('Applying a clean installation reset');
  await browser.removeApp(env.androidAppPackage);
  await browser.installApp(env.androidAppPath);
  await appLifecycle.returnToForeground();
}

export async function resetPermissions(): Promise<void> {
  await revoke('camera');
  await revoke('location');
  await revoke('storage');
}
