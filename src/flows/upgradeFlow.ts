import { browser } from '@wdio/globals';

import { loadEnv } from '../config/env';
import { createModuleLogger } from '../logging/logger';
import { getAppVersionName } from '../services/adbService';

import { launchApplication } from './applicationLaunchFlow';
import { installCleanly } from './installationFlow';

const logger = createModuleLogger('upgrade-flow');

export interface UpgradePrerequisites {
  baselineApkPath: string;
  targetApkPath: string;
}

export function resolveUpgradePrerequisites(): UpgradePrerequisites | null {
  const env = loadEnv();
  if (!env.baselineApkPath || !env.targetApkPath) {
    return null;
  }
  return { baselineApkPath: env.baselineApkPath, targetApkPath: env.targetApkPath };
}

export async function installBaseline(baselineApkPath: string): Promise<void> {
  await installCleanly(baselineApkPath);
}

export async function upgradeToTarget(targetApkPath: string): Promise<void> {
  logger.info({ targetApkPath }, 'Installing the target APK over the existing installation');
  await browser.installApp(targetApkPath);
  await launchApplication();
}

export async function getInstalledVersionName(): Promise<string> {
  const env = loadEnv();
  return getAppVersionName(env.androidAppPackage);
}
