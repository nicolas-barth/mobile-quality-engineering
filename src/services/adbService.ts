import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

import { createModuleLogger } from '../logging/logger';

const execFile = promisify(execFileCallback);
const logger = createModuleLogger('adb-service');

const PACKAGE_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;

export function assertValidPackageName(packageName: string): void {
  if (!PACKAGE_NAME_PATTERN.test(packageName)) {
    throw new Error(`Refusing to run adb against an invalid package name: "${packageName}"`);
  }
}

async function runAdb(args: string[]): Promise<{ stdout: string; stderr: string }> {
  logger.debug({ args }, 'Running adb command');
  return execFile('adb', args);
}

export async function isDeviceConnected(): Promise<boolean> {
  const { stdout } = await runAdb(['devices']);
  return stdout
    .split('\n')
    .slice(1)
    .some((line) => line.trim().endsWith('device'));
}

export async function getDeviceModel(): Promise<string> {
  const { stdout } = await runAdb(['shell', 'getprop', 'ro.product.model']);
  return stdout.trim();
}

export async function getAndroidVersion(): Promise<string> {
  const { stdout } = await runAdb(['shell', 'getprop', 'ro.build.version.release']);
  return stdout.trim();
}

export async function getAppVersionName(packageName: string): Promise<string> {
  assertValidPackageName(packageName);
  const { stdout } = await runAdb(['shell', 'dumpsys', 'package', packageName]);
  const match = /versionName=(\S+)/.exec(stdout);
  if (!match?.[1]) {
    throw new Error(`Could not determine the installed version of ${packageName}`);
  }
  return match[1];
}

export async function clearAppData(packageName: string): Promise<void> {
  assertValidPackageName(packageName);
  await runAdb(['shell', 'pm', 'clear', packageName]);
}

export async function getForegroundActivity(): Promise<string> {
  const { stdout } = await runAdb(['shell', 'dumpsys', 'activity', 'activities']);
  const match = /mResumedActivity: ActivityRecord\{[^ ]+ [^ ]+ ([^ ]+)/.exec(stdout);
  if (!match?.[1]) {
    throw new Error('Could not determine the foreground activity from dumpsys output');
  }
  return match[1];
}

export async function collectLogcat(maxLines: number = 200): Promise<string | null> {
  try {
    const { stdout } = await runAdb(['logcat', '-d', '-t', maxLines.toString()]);
    return stdout;
  } catch (logcatError) {
    logger.warn({ err: logcatError }, 'Failed to collect logcat, continuing without it');
    return null;
  }
}
