import allureReporter from '@wdio/allure-reporter';

import { DeviceInfo } from '../types/device';

export async function attachDeviceInfo(deviceInfo: DeviceInfo): Promise<void> {
  await allureReporter.addAttachment(
    'Device information',
    JSON.stringify(deviceInfo, null, 2),
    'application/json',
  );
}

export async function attachScreenshot(name: string, screenshotBase64: string): Promise<void> {
  await allureReporter.addAttachment(name, Buffer.from(screenshotBase64, 'base64'), 'image/png');
}

export async function attachPageSource(pageSource: string): Promise<void> {
  await allureReporter.addAttachment('Page source', pageSource, 'application/xml');
}

export async function attachError(error: Error): Promise<void> {
  await allureReporter.addAttachment(
    'Error details',
    JSON.stringify({ message: error.message, stack: error.stack }, null, 2),
    'application/json',
  );
}

export async function attachLogcat(logcat: string): Promise<void> {
  await allureReporter.addAttachment('Logcat', logcat, 'text/plain');
}
