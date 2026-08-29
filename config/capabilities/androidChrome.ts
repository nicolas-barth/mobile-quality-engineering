import { buildAndroidStandardProfile } from '../devices/android-standard';

export function buildAndroidChromeCapability(): WebdriverIO.Capabilities {
  const device = buildAndroidStandardProfile();

  return {
    platformName: 'Android',
    browserName: 'Chrome',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': device.deviceName,
    'appium:platformVersion': device.platformVersion,
    'appium:newCommandTimeout': 240,
  };
}
