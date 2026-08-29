import { loadEnv } from '../../src/config/env';

export interface DeviceProfile {
  name: string;
  deviceName: string;
  platformVersion: string;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
}

export function buildAndroidStandardProfile(): DeviceProfile {
  const env = loadEnv();

  return {
    name: 'android-standard',
    deviceName: env.androidDeviceName,
    platformVersion: env.androidPlatformVersion,
    orientation: 'PORTRAIT',
  };
}
