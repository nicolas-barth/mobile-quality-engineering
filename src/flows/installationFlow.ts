import { browser } from '@wdio/globals';

import { loadEnv } from '../config/env';
import { isInstalled } from '../device/appState';
import { createModuleLogger } from '../logging/logger';
import { getAppVersionName } from '../services/adbService';

import { launchApplication } from './applicationLaunchFlow';

const logger = createModuleLogger('installation-flow');

export async function installCleanly(apkPath: string): Promise<void> {
  const env = loadEnv();

  if (await isInstalled()) {
    logger.info('Application already installed, removing it before a clean install');
    await browser.removeApp(env.androidAppPackage);
  }

  logger.info({ apkPath }, 'Installing the application');
  await browser.installApp(apkPath);
  await launchApplication();
}

export async function uninstallCompletely(): Promise<void> {
  const env = loadEnv();
  logger.info('Uninstalling the application');
  await browser.removeApp(env.androidAppPackage);
}

export async function verifyInstalledVersion(expectedVersionName: string): Promise<void> {
  const env = loadEnv();
  const installedVersion = await getAppVersionName(env.androidAppPackage);

  if (installedVersion !== expectedVersionName) {
    throw new Error(
      `Expected installed version "${expectedVersionName}" but found "${installedVersion}"`,
    );
  }
}
