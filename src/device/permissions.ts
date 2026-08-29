import { browser } from '@wdio/globals';

import { loadEnv } from '../config/env';
import { createModuleLogger } from '../logging/logger';

const logger = createModuleLogger('permissions');

export type AndroidPermission = 'camera' | 'location' | 'storage';

const PERMISSION_NAMES: Record<AndroidPermission, string> = {
  camera: 'android.permission.CAMERA',
  location: 'android.permission.ACCESS_FINE_LOCATION',
  storage: 'android.permission.WRITE_EXTERNAL_STORAGE',
};

export async function grant(permission: AndroidPermission): Promise<void> {
  await changePermission(permission, 'grant');
}

export async function revoke(permission: AndroidPermission): Promise<void> {
  await changePermission(permission, 'revoke');
}

async function changePermission(
  permission: AndroidPermission,
  action: 'grant' | 'revoke',
): Promise<void> {
  const env = loadEnv();
  logger.info({ permission, action }, 'Changing Android runtime permission');
  await browser.execute('mobile: changePermissions', {
    permissions: [PERMISSION_NAMES[permission]],
    action,
    appPackage: env.androidAppPackage,
    target: 'app',
  });
}

export async function isGranted(permission: AndroidPermission): Promise<boolean> {
  const env = loadEnv();
  const result = await browser.execute('mobile: getPermissions', {
    type: 'granted',
    appPackage: env.androidAppPackage,
  });
  const grantedPermissions = result as string[];

  return grantedPermissions.some((granted) => PERMISSION_NAMES[permission].endsWith(granted));
}
