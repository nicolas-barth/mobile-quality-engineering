import { loadEnv } from '../../src/config/env';
import { DeviceProfile } from '../devices/android-standard';

export function buildAndroidCapability(device: DeviceProfile): WebdriverIO.Capabilities {
  const env = loadEnv();

  return {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': device.deviceName,
    'appium:platformVersion': device.platformVersion,
    'appium:app': env.androidAppPath,
    'appium:appPackage': env.androidAppPackage,
    'appium:appActivity': env.androidAppActivity,
    'appium:orientation': device.orientation,
    'appium:autoGrantPermissions': true,
    'appium:noReset': env.noReset,
    'appium:fullReset': env.fullReset,
    'appium:newCommandTimeout': 240,
  };
}
