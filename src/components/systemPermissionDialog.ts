import { $ } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';

import { createModuleLogger } from '../logging/logger';

const logger = createModuleLogger('system-permission-dialog');

const ALLOW_BUTTON_IDS = [
  'com.android.permissioncontroller:id/permission_allow_foreground_only_button',
  'com.android.permissioncontroller:id/permission_allow_button',
  'com.google.android.permissioncontroller:id/permission_allow_foreground_only_button',
  'com.google.android.permissioncontroller:id/permission_allow_button',
];

const DENY_BUTTON_IDS = [
  'com.android.permissioncontroller:id/permission_deny_button',
  'com.google.android.permissioncontroller:id/permission_deny_button',
];

async function findFirstExisting(resourceIds: string[]): Promise<ChainablePromiseElement | null> {
  for (const resourceId of resourceIds) {
    const element = $(`android=new UiSelector().resourceId("${resourceId}")`);
    if (await element.isExisting()) {
      return element;
    }
  }
  return null;
}

export async function isDisplayed(): Promise<boolean> {
  return (await findFirstExisting([...ALLOW_BUTTON_IDS, ...DENY_BUTTON_IDS])) !== null;
}

export async function allow(): Promise<void> {
  const button = await findFirstExisting(ALLOW_BUTTON_IDS);
  if (!button) {
    throw new Error(
      'Could not locate an "allow" button on the system permission dialog for this Android version',
    );
  }
  logger.info('Allowing the requested permission on the system dialog');
  await button.click();
}

export async function deny(): Promise<void> {
  const button = await findFirstExisting(DENY_BUTTON_IDS);
  if (!button) {
    throw new Error(
      'Could not locate a "deny" button on the system permission dialog for this Android version',
    );
  }
  logger.info('Denying the requested permission on the system dialog');
  await button.click();
}
