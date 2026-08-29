import { browser } from '@wdio/globals';

import { DeviceInfo } from '../types/device';

function readCapability(capabilities: Record<string, unknown>, key: string): string {
  const value = capabilities[key] ?? capabilities[`appium:${key}`];
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  return 'unknown';
}

export async function collectDeviceInfo(): Promise<DeviceInfo> {
  const capabilities = browser.capabilities as Record<string, unknown>;
  const orientation = await browser.getOrientation();

  return {
    platformName: readCapability(capabilities, 'platformName'),
    platformVersion: readCapability(capabilities, 'platformVersion'),
    deviceName: readCapability(capabilities, 'deviceName'),
    orientation,
    appPackage: readCapability(capabilities, 'appPackage'),
    appActivity: readCapability(capabilities, 'appActivity'),
    automationName: readCapability(capabilities, 'automationName'),
  };
}
